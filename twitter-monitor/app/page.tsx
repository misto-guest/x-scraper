export default function HomePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Twitter Monitor
        </h1>
        <p style={{ color: '#666' }}>
          Automated X.com content monitoring with keyword-based relevance filtering
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📊 Dashboard</h2>
          <p>View statistics and recent activity</p>
          <a href="/dashboard" style={{ color: '#0066cc' }}>Open Dashboard →</a>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>👤 Profiles</h2>
          <p>Manage monitored Twitter profiles</p>
          <a href="/admin/profiles" style={{ color: '#0066cc' }}>Manage Profiles →</a>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🔑 Keywords</h2>
          <p>Configure relevance keywords</p>
          <a href="/admin/keywords" style={{ color: '#0066cc' }}>Manage Keywords →</a>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🐦 Tweets</h2>
          <p>Review and manage tweets</p>
          <a href="/admin/tweets" style={{ color: '#0066cc' }}>View Tweets →</a>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🔗 Projects</h2>
          <p>Connect tweets to your projects</p>
          <a href="/admin/projects" style={{ color: '#0066cc' }}>Manage Projects →</a>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📖 API</h2>
          <p>RESTful API documentation</p>
          <a href="/api" style={{ color: '#0066cc' }}>View API Docs →</a>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Start</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Ensure GhostFetch is running: <code>ghostfetch serve --port 8000</code></li>
          <li>Add a profile to monitor (e.g., @notgrahamp)</li>
          <li>Configure keywords for relevance filtering</li>
          <li>Trigger manual scraping or wait for daily auto-scrape</li>
          <li>Review pending tweets and connect to projects</li>
        </ol>
      </div>
    </div>
  );
}
