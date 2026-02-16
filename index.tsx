
import React from 'react';
import ReactDOM from 'react-dom/client';
import GrowthApp from './GrowthApp';

// 1. Force Unregister any stale Service Workers & Clear Cache
// This prevents the "Zombie App" issue where Vercel deployments don't show up
const cleanupCachesAndWorkers = async () => {
  console.log("Checking for stale caches and workers...");
  
  // A. Unregister Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log("Unregistering SW:", registration);
        await registration.unregister();
      }
    } catch (err) {
      console.warn("SW cleanup failed:", err);
    }
  }

  // B. Delete Cache Storage (Aggressive Cache Busting)
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        console.log("Deleting cache:", key);
        await caches.delete(key);
      }
    } catch (err) {
      console.warn("Cache cleanup failed:", err);
    }
  }
};

// Execute immediately
cleanupCachesAndWorkers();

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
