import React from 'react';
import ReactDOM from 'react-dom/client';
import GrowthApp from './GrowthApp';

// 1. Force Unregister any stale Service Workers (Fixes the "Wrong App" caching issue)
// We defer this to the load event to ensure the document is in a valid state
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          console.log("Unregistering stale service worker:", registration);
          registration.unregister();
        }
      }).catch(err => console.error("Error unregistering service workers:", err));
    } catch (e) {
      console.error("Service Worker access error:", e);
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GrowthApp />
  </React.StrictMode>
);