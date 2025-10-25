import React from 'react';
import ReactDOM from 'react-dom/client';
import { app } from '@microsoft/teams-js';
import App from './App';
import './index.css';

// Initialize Teams SDK (non-blocking)
app.initialize().then(() => {
  console.log('Teams SDK initialized');
}).catch((error) => {
  console.warn('Failed to initialize Teams SDK (running outside Teams):', error);
});

// Render app immediately (don't wait for Teams SDK)
console.log('Starting React render...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('React render initiated');
  } catch (error) {
    console.error('Failed to render React app:', error);
    // Show error on page
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Render Error</h2>
      <pre>${error}</pre>
    </div>`;
  }
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found!</div>';
}
