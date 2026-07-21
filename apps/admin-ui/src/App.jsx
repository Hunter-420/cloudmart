import './index.css';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        ☁️ CloudMart Admin
      </h1>
      <p style={{ color: '#64748b' }}>
        Admin dashboard — implement your pages here following the API docs.
      </p>
      <ul style={{ marginTop: '1rem', color: '#2563eb', paddingLeft: '1.5rem' }}>
        <li>Pages: Dashboard, Products, Orders, Users, Analytics</li>
        <li>API calls: import from <code>src/services/api.js</code></li>
        <li>Reference: <a href="../docs/index.html">CloudMart Docs</a></li>
      </ul>
    </div>
  );
}

export default App;
