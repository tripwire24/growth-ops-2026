import React from 'react';
import ReactDOM from 'react-dom/client';
import GrowthApp from './GrowthApp';

// 1. Force Unregister any stale Service Workers (Fixes the "Wrong App" caching issue)
const cleanupServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log("Unregistering stale service worker:", registration);
        try {
          await registration.unregister();
        } catch (err) {
          console.warn("Failed to unregister specific SW:", err);
        }
      }
    } catch (error) {
      // Catch "The document is in an invalid state" or other access errors safely
      console.warn("Service Worker cleanup skipped (harmless):", error);
    }
  }
};

// Execute when the page is fully loaded
if (document.readyState === 'complete') {
  cleanupServiceWorkers();
} else {
  window.addEventListener('load', cleanupServiceWorkers);
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