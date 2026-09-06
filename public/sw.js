// Investify Service Worker - Handles offline notifications and notification click interactions
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle notification click when user taps notification while app is closed or backgrounded
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionTab = event.notification.data?.actionTab || 'plans';
  const targetUrl = `/?tab=${actionTab}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: actionTab });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
