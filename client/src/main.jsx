import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#080c14', color: '#FC6255', fontFamily: 'JetBrains Mono, monospace',
          padding: '40px', minHeight: '100vh', whiteSpace: 'pre-wrap', fontSize: '13px'
        }}>
          <div style={{ color: '#58C4DD', fontSize: '20px', marginBottom: '16px' }}>
            ⚠️ Dots — React Error
          </div>
          <div style={{ color: '#f0c040', marginBottom: '12px' }}>
            {this.state.error.message}
          </div>
          <div style={{ color: '#8899aa', fontSize: '11px' }}>
            {this.state.error.stack}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px', background: '#58C4DD', border: 'none',
              borderRadius: '8px', color: '#080c14', padding: '10px 20px',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px'
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);