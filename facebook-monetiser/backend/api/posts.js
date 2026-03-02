const express = require('express');
const router = express.Router();
const riskScorer = require('../services/risk-scoring');

// Get all posts with filtering
router.get('/', (req, res) => {
  const db = req.db;
  const { page_id, status, content_type, limit = 50 } = req.query;

  let sql = `
    SELECT gp.*, p.name as page_name, s.title as source_title
    FROM generated_posts gp
    JOIN pages p ON gp.page_id = p.id
    LEFT JOIN sources s ON gp.source_id = s.id
    WHERE 1=1
  `;
  const params = [];
  const conditions = [];

  if (page_id) {
    conditions.push('gp.page_id = ?');
    params.push(page_id);
  }

  if (status) {
    conditions.push('gp.approval_status = ?');
    params.push(status);
  }

  if (content_type) {
    conditions.push('gp.content_type = ?');
    params.push(content_type);
  }

  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY gp.created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ posts: rows, count: rows.length });
  });
});

// Get single post with performance
router.get('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.get('SELECT * FROM generated_posts WHERE id = ?', [id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get performance data
    db.get('SELECT * FROM post_performance WHERE post_id = ?', [id], (err, performance) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      post.performance = performance;
      res.json({ post });
    });
  });
});

// Create new post
router.post('/', (req, res) => {
  const db = req.db;
  const {
    page_id,
    content_type,
    caption,
    first_comment,
    image_prompt,
    source_id,
    competitor_id,
    scheduled_for
  } = req.body;

  // Calculate risk score
  const riskScore = riskScorer.calculateRiskScore(caption || '');

  // Determine approval status based on risk
  let approvalStatus = 'pending';
  if (riskScore < 0.3) {
    approvalStatus = 'auto_approved';
  } else if (riskScore >= 0.7) {
    approvalStatus = 'pending'; // High risk requires manual review
  }

  const sql = `
    INSERT INTO generated_posts (
      page_id, content_type, caption, first_comment, image_prompt,
      source_id, competitor_id, risk_score, approval_status, scheduled_for
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    page_id,
    content_type,
    caption,
    first_comment,
    image_prompt,
    source_id || null,
    competitor_id || null,
    riskScore,
    approvalStatus,
    scheduled_for || null
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Post created successfully',
      post_id: this.lastID,
      risk_score: riskScore,
      approval_status: approvalStatus
    });
  });
});

// Update post
router.put('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { caption, first_comment, image_prompt, scheduled_for } = req.body;

  // Recalculate risk if caption changed
  let riskScore = null;
  if (caption) {
    riskScore = riskScorer.calculateRiskScore(caption);
  }

  const sql = `
    UPDATE generated_posts
    SET caption = COALESCE(?, caption),
        first_comment = COALESCE(?, first_comment),
        image_prompt = COALESCE(?, image_prompt),
        scheduled_for = COALESCE(?, scheduled_for),
        risk_score = COALESCE(?, risk_score)
    WHERE id = ?
  `;
  const params = [caption, first_comment, image_prompt, scheduled_for, riskScore, id];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post updated successfully', risk_score: riskScore });
  });
});

// Approve/reject post
router.put('/:id/approval', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['approved', 'rejected', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }

  const sql = 'UPDATE generated_posts SET approval_status = ? WHERE id = ?';

  db.run(sql, [status, id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: `Post ${status} successfully` });
  });
});

// Mark post as posted
router.post('/:id/post', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { platform_post_id } = req.body;

  const sql = `
    UPDATE generated_posts
    SET approval_status = 'posted',
        posted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update with platform post ID if provided
    if (platform_post_id) {
      db.run(
        'UPDATE generated_posts SET platform_post_id = ? WHERE id = ?',
        [platform_post_id, id],
        (err) => {
          if (err) {
            console.error('Error updating platform post ID:', err);
          }
        }
      );
    }

    res.json({ message: 'Post marked as posted' });
  });
});

// Add/update performance data
router.put('/:id/performance', (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const {
    reach,
    impressions,
    engagement_rate,
    clicks,
    shares,
    comments,
    likes,
    saves,
    cpc,
    ctr
  } = req.body;

  const sql = `
    INSERT OR REPLACE INTO post_performance (
      post_id, platform_post_id, reach, impressions, engagement_rate,
      clicks, shares, comments, likes, saves, cpc, ctr
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id,
    req.body.platform_post_id || null,
    reach || 0,
    impressions || 0,
    engagement_rate || 0,
    clicks || 0,
    shares || 0,
    comments || 0,
    likes || 0,
    saves || 0,
    cpc || null,
    ctr || null
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Performance data updated successfully' });
  });
});

// Delete post
router.delete('/:id', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('DELETE FROM generated_posts WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// Get posts requiring approval
router.get('/queue/approval', (req, res) => {
  const db = req.db;
  const { min_risk = 0.5 } = req.query;

  const sql = `
    SELECT gp.*, p.name as page_name
    FROM generated_posts gp
    JOIN pages p ON gp.page_id = p.id
    WHERE gp.approval_status = 'pending'
      AND gp.risk_score >= ?
    ORDER BY gp.risk_score DESC, gp.created_at ASC
  `;

  db.all(sql, [parseFloat(min_risk)], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ posts: rows, count: rows.length });
  });
});

// Get scheduled posts
router.get('/queue/scheduled', (req, res) => {
  const db = req.db;

  const sql = `
    SELECT gp.*, p.name as page_name
    FROM generated_posts gp
    JOIN pages p ON gp.page_id = p.id
    WHERE gp.approval_status IN ('auto_approved', 'approved')
      AND gp.scheduled_for IS NOT NULL
      AND gp.posted_at IS NULL
    ORDER BY gp.scheduled_for ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ posts: rows, count: rows.length });
  });
});

module.exports = router;
