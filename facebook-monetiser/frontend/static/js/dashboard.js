// API Base URL
const API_BASE = '/api';

// Global state
let pages = [];
let sources = [];
let posts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadPages();
  loadSources();
  loadPosts();
  loadLogs();
  setupFormHandlers();
});

// Tab Navigation
function showTab(tabName) {
  // Hide all content
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  // Remove active from all tabs
  document.querySelectorAll('[id^="tab-"]').forEach(el => {
    el.classList.remove('tab-active');
    el.classList.add('text-gray-500');
  });
  // Show selected content
  document.getElementById(`content-${tabName}`).classList.remove('hidden');
  // Activate tab
  const tab = document.getElementById(`tab-${tabName}`);
  tab.classList.add('tab-active');
  tab.classList.remove('text-gray-500');

  // Load logs when logs tab is shown
  if (tabName === 'logs') {
    loadLogs();
  }
}

// Load Pages
async function loadPages() {
  try {
    const res = await fetch(`${API_BASE}/pages`);
    const data = await res.json();
    pages = data.pages;
    renderPages();
    updatePageSelect();
  } catch (error) {
    console.error('Error loading pages:', error);
    document.getElementById('pages-list').innerHTML = '<p class="text-red-500">Error loading pages</p>';
  }
}

function renderPages() {
  const container = document.getElementById('pages-list');
  if (pages.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No pages yet. Add your first Facebook page!</p>';
    return;
  }

  container.innerHTML = pages.map(page => `
    <div class="bg-gray-50 rounded-lg p-4 border">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-lg">${page.name}</h3>
          <p class="text-gray-600 text-sm">ID: ${page.page_id}</p>
          <p class="text-gray-600 text-sm">${page.category || 'No category'}</p>
          <div class="mt-2 flex space-x-4 text-sm text-gray-500">
            <span>👥 ${page.followers_count?.toLocaleString() || 0} followers</span>
            <span>📦 ${page.assets_count || 0} assets</span>
            <span>📝 ${page.posts_count || 0} posts</span>
          </div>
          <span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">🇺🇸 US</span>
        </div>
        <button onclick="deletePage(${page.id})" class="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </div>
  `).join('');
}

function updatePageSelect() {
  const select = document.getElementById('post-page');
  if (!select) return;
  select.innerHTML = '<option value="">Choose a page...</option>' +
    pages.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

// Load Sources
async function loadSources() {
  try {
    const res = await fetch(`${API_BASE}/sources`);
    const data = await res.json();
    sources = data.sources;
    renderSources();
  } catch (error) {
    console.error('Error loading sources:', error);
    document.getElementById('sources-list').innerHTML = '<p class="text-red-500">Error loading sources</p>';
  }
}

function renderSources() {
  const container = document.getElementById('sources-list');
  if (sources.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No sources yet. Add your first source!</p>';
    return;
  }

  container.innerHTML = sources.map(source => `
    <div class="bg-gray-50 rounded-lg p-4 border">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <span class="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">${source.source_type}</span>
            <h3 class="font-bold">${source.title || 'Untitled'}</h3>
          </div>
          <p class="text-gray-600 text-sm line-clamp-2">${source.content_text || 'No content'}</p>
          ${source.url ? `<a href="${source.url}" target="_blank" class="text-blue-500 text-sm hover:underline">View Source</a>` : ''}
          ${source.author ? `<p class="text-gray-500 text-xs mt-1">By: ${source.author}</p>` : ''}
        </div>
        <div class="ml-4 flex flex-col space-y-2">
          <button onclick="addInsight(${source.id})" class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">+ Insight</button>
          <button onclick="deleteSource(${source.id})" class="text-sm text-red-500 hover:text-red-700">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Load Posts
async function loadPosts() {
  try {
    const filter = document.getElementById('post-filter')?.value || '';
    const url = filter ? `${API_BASE}/posts?status=${filter}` : `${API_BASE}/posts`;
    const res = await fetch(url);
    const data = await res.json();
    posts = data.posts;
    renderPosts();
  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('posts-list').innerHTML = '<p class="text-red-500">Error loading posts</p>';
  }
}

function renderPosts() {
  const container = document.getElementById('posts-list');
  if (posts.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No posts yet. Create your first post!</p>';
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="bg-gray-50 rounded-lg p-4 border">
      <div class="flex justify-between items-start mb-3">
        <div>
          <span class="px-2 py-1 text-xs rounded ${getContentTypeClass(post.content_type)}">${post.content_type}</span>
          <span class="ml-2 text-sm text-gray-500">${post.page_name || 'Unknown Page'}</span>
        </div>
        <span class="px-2 py-1 text-xs rounded ${getStatusClass(post.approval_status)}">${post.approval_status}</span>
      </div>
      <p class="text-gray-800 mb-2 line-clamp-3">${post.caption || 'No caption'}</p>
      <div class="flex justify-between items-center text-sm text-gray-500">
        <div class="space-x-3">
          <span>Risk: ${getRiskBadge(post.risk_score)}</span>
          <span>Originality: ${(post.originality_score * 100).toFixed(0)}%</span>
        </div>
        <div class="space-x-2">
          ${post.approval_status === 'pending' ? `
            <button onclick="approvePost(${post.id})" class="text-green-600 hover:text-green-800">Approve</button>
            <button onclick="rejectPost(${post.id})" class="text-red-600 hover:text-red-800">Reject</button>
          ` : ''}
          <button onclick="deletePost(${post.id})" class="text-gray-600 hover:text-gray-800">Delete</button>
        </div>
      </div>
      ${post.scheduled_for ? `<p class="text-xs text-gray-500 mt-2">📅 Scheduled: ${new Date(post.scheduled_for).toLocaleString()}</p>` : ''}
    </div>
  `).join('');
}

function getContentTypeClass(type) {
  const classes = {
    image: 'bg-blue-100 text-blue-800',
    reel: 'bg-pink-100 text-pink-800',
    text: 'bg-gray-100 text-gray-800',
    carousel: 'bg-purple-100 text-purple-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
}

function getStatusClass(status) {
  const classes = {
    pending: 'status-pending',
    auto_approved: 'status-approved',
    approved: 'status-approved',
    scheduled: 'status-approved',
    posted: 'status-posted',
    rejected: 'status-rejected'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getRiskBadge(score) {
  if (score < 0.3) return '<span class="text-green-600">Low</span>';
  if (score < 0.6) return '<span class="text-yellow-600">Medium</span>';
  return '<span class="text-red-600">High</span>';
}

function filterPosts() {
  loadPosts();
}

// Form Handlers
function setupFormHandlers() {
  // Add Page Form
  document.getElementById('add-page-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeModal('add-page-modal');
        e.target.reset();
        loadPages();
        alert('Page added successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add page');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });

  // Add Source Form
  document.getElementById('add-source-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeModal('add-source-modal');
        e.target.reset();
        loadSources();
        alert('Source added successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add source');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });

  // Create Post Form
  document.getElementById('create-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      page_id: parseInt(document.getElementById('post-page').value),
      content_type: document.getElementById('post-type').value,
      caption: document.getElementById('post-caption').value,
      first_comment: document.getElementById('post-comment').value || null,
      image_prompt: document.getElementById('post-image-prompt').value || null,
      scheduled_for: document.getElementById('post-schedule').value || null
    };

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Post created! Risk Score: ${result.risk_score.toFixed(2)}\nStatus: ${result.approval_status}`);
        document.getElementById('create-post-form').reset();
        loadPosts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });

  // Caption risk analysis on input
  document.getElementById('post-caption')?.addEventListener('input', async (e) => {
    const caption = e.target.value;
    if (caption.length > 20) {
      try {
        const res = await fetch(`${API_BASE}/content/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption })
        });
        const data = await res.json();
        const riskDiv = document.getElementById('caption-risk');
        riskDiv.innerHTML = `Risk Score: <span class="${data.overall_risk_score < 0.3 ? 'text-green-600' : data.overall_risk_score < 0.6 ? 'text-yellow-600' : 'text-red-600'}">${data.overall_risk_score.toFixed(2)}</span> - ${data.recommendation}`;
      } catch (error) {
        console.error('Error analyzing caption:', error);
      }
    }
  });
}

// Modal Functions
function showAddPageModal() {
  document.getElementById('add-page-modal').classList.remove('hidden');
}

function showAddSourceModal() {
  document.getElementById('add-source-modal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// CRUD Operations
async function deletePage(id) {
  if (!confirm('Are you sure you want to delete this page?')) return;

  try {
    const res = await fetch(`${API_BASE}/pages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadPages();
      alert('Page deleted successfully');
    }
  } catch (error) {
    alert('Error deleting page: ' + error.message);
  }
}

async function deleteSource(id) {
  if (!confirm('Are you sure you want to delete this source?')) return;

  try {
    const res = await fetch(`${API_BASE}/sources/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadSources();
      alert('Source deleted successfully');
    }
  } catch (error) {
    alert('Error deleting source: ' + error.message);
  }
}

async function addInsight(sourceId) {
  const insightText = prompt('Enter insight:');
  if (!insightText) return;

  try {
    const res = await fetch(`${API_BASE}/sources/${sourceId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insight_text: insightText })
    });

    if (res.ok) {
      alert('Insight added successfully!');
      loadSources();
    } else {
      alert('Failed to add insight');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function approvePost(id) {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}/approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    });

    if (res.ok) {
      loadPosts();
    }
  } catch (error) {
    alert('Error approving post: ' + error.message);
  }
}

async function rejectPost(id) {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}/approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });

    if (res.ok) {
      loadPosts();
    }
  } catch (error) {
    alert('Error rejecting post: ' + error.message);
  }
}

async function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadPosts();
      alert('Post deleted successfully');
    }
  } catch (error) {
    alert('Error deleting post: ' + error.message);
  }
}

// AI Content Generation
async function generateCaption() {
  try {
    const res = await fetch(`${API_BASE}/content/caption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const data = await res.json();
    document.getElementById('post-caption').value = data.caption;
    alert(`Caption generated! Risk Score: ${data.risk_score.toFixed(2)}`);
  } catch (error) {
    alert('Error generating caption: ' + error.message);
  }
}

async function generateComment() {
  const caption = document.getElementById('post-caption').value;
  try {
    const res = await fetch(`${API_BASE}/content/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption, include_cta: true })
    });

    const data = await res.json();
    document.getElementById('post-comment').value = data.comment;
  } catch (error) {
    alert('Error generating comment: ' + error.message);
  }
}

async function generateImagePrompt() {
  const caption = document.getElementById('post-caption').value;
  try {
    const res = await fetch(`${API_BASE}/content/image-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption })
    });

    const data = await res.json();
    document.getElementById('post-image-prompt').value = data.prompt;
  } catch (error) {
    alert('Error generating image prompt: ' + error.message);
  }
}

async function analyzeContent() {
  const caption = document.getElementById('post-caption').value;
  const comment = document.getElementById('post-comment').value;

  try {
    const res = await fetch(`${API_BASE}/content/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption, first_comment: comment })
    });

    const data = await res.json();
    alert(`Risk Analysis:\n\nCaption Risk: ${data.caption_risk_score.toFixed(2)}\nComment Risk: ${data.comment_risk_score.toFixed(2)}\nOverall Risk: ${data.overall_risk_score.toFixed(2)}\n\nRecommendation: ${data.recommendation}`);
  } catch (error) {
    alert('Error analyzing content: ' + error.message);
  }
}

// Refresh Data
function refreshData() {
  loadPages();
  loadSources();
  loadPosts();
  loadLogs();
  alert('Data refreshed!');
}

// Update source help text based on type
function updateSourceHelp() {
  const sourceType = document.querySelector('[name="source_type"]').value;
  const helpText = document.getElementById('source-help');

  const helpMessages = {
    'tweet': 'Paste a tweet URL to extract viral content patterns',
    'article': 'Paste an article URL for trending topics and insights',
    'case_study': 'Add a case study for success story analysis',
    'video': 'Paste a video URL (YouTube, etc.) for content ideas',
    'competitor_post': 'Paste a Facebook page URL to automatically scrape their top posts'
  };

  helpText.textContent = helpMessages[sourceType] || '';
}

// Load Logs
let logs = [];

async function loadLogs() {
  try {
    const res = await fetch(`${API_BASE}/logs`);
    const data = await res.json();
    logs = data.logs || [];
    renderLogs();
    updateLogStats();
  } catch (error) {
    console.error('Error loading logs:', error);
    // Create sample logs if API fails
    logs = createSampleLogs();
    renderLogs();
    updateLogStats();
  }
}

function createSampleLogs() {
  return [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      type: 'automation',
      action: 'Follower count scraped',
      details: 'Updated follower counts for 5 pages',
      status: 'success'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'generation',
      action: 'Caption generated',
      details: 'Generated caption for 90s nostalgia post',
      status: 'success'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'posting',
      action: 'Post created',
      details: 'New draft post created for Nike page',
      status: 'success'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      type: 'scraping',
      action: 'Competitor scraped',
      details: 'Scraped 25 posts from Adidas page',
      status: 'success'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'system',
      action: 'Daily backup',
      details: 'Database backup completed',
      status: 'success'
    }
  ];
}

function renderLogs() {
  const container = document.getElementById('logs-list');

  if (logs.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center p-6">No logs yet. Activity will appear here.</p>';
    return;
  }

  const typeIcons = {
    'scraping': '🔍',
    'generation': '✨',
    'posting': '📋',
    'automation': '🤖',
    'system': '⚙️'
  };

  const statusColors = {
    'success': 'text-green-700 bg-green-50',
    'error': 'text-red-700 bg-red-50',
    'pending': 'text-yellow-700 bg-yellow-50'
  };

  container.innerHTML = logs.map(log => {
    const date = new Date(log.timestamp);
    const timeAgo = getTimeAgo(date);
    const icon = typeIcons[log.type] || '📌';
    const statusClass = statusColors[log.status] || 'text-gray-700 bg-gray-50';

    return `
      <div class="p-4 hover:bg-gray-50">
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3 flex-1">
            <span class="text-2xl">${icon}</span>
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <p class="font-semibold text-gray-900">${log.action}</p>
                <span class="px-2 py-1 rounded text-xs font-medium ${statusClass}">${log.status}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">${log.details}</p>
              <p class="text-xs text-gray-400 mt-2">${timeAgo}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateLogStats() {
  const postsCreated = logs.filter(l => l.type === 'posting' && l.status === 'success').length;
  const contentGenerated = logs.filter(l => l.type === 'generation' && l.status === 'success').length;
  const scrapingRuns = logs.filter(l => l.type === 'scraping' && l.status === 'success').length;
  const followerUpdates = logs.filter(l => l.type === 'automation' && l.action.includes('Follower')).length;

  document.getElementById('stat-posts-created').textContent = postsCreated;
  document.getElementById('stat-content-generated').textContent = contentGenerated;
  document.getElementById('stat-scraping-runs').textContent = scrapingRuns;
  document.getElementById('stat-follower-updates').textContent = followerUpdates;
}

function filterLogs() {
  const filter = document.getElementById('log-filter').value;
  const filteredLogs = filter ? logs.filter(log => log.type === filter) : logs;

  const container = document.getElementById('logs-list');
  if (filteredLogs.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center p-6">No logs found for this filter.</p>';
  } else {
    // Temporarily replace logs with filtered for rendering
    const originalLogs = logs;
    logs = filteredLogs;
    renderLogs();
    logs = originalLogs;
  }
}

function refreshLogs() {
  loadLogs();
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

