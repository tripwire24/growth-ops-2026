import React from 'react';
import ReactDOM from 'react-dom/client';
import GrowthApp from './GrowthApp';

// 1. Force Unregister any stale Service Workers (Fixes the "Wrong App" caching issue)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log("Unregistering stale service worker:", registration);
      registration.unregister();
    }
  });
}

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