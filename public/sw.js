// Investify Service Worker - Handles background scheduling, offline notifications, and deep link navigation
const scheduledTimers = new Map();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages from client tabs/windows
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;

  switch (event.data.type) {
    case 'SCHEDULE_NOTIFICATION': {
      const { id, title, body, scheduleTimestamp, extra } = event.data.payload || {};
      if (!title) return;

      const now = Date.now();
      const delay = Math.max(0, (scheduleTimestamp || now) - now);

      // Clear any existing timer for this ID
      if (id && scheduledTimers.has(id)) {
        clearTimeout(scheduledTimers.get(id));
        scheduledTimers.delete(id);
      }

      if (delay <= 500) {
        // Show immediately
        self.registration.showNotification(title, {
          body: body || '',
          icon: '/favicon.png',
          badge: '/favicon.png',
          data: extra,
          vibrate: [200, 100, 200],
        });
      } else {
        // Schedule for future background execution
        const timerId = setTimeout(() => {
          self.registration.showNotification(title, {
            body: body || '',
            icon: '/favicon.png',
            badge: '/favicon.png',
            data: extra,
            vibrate: [200, 100, 200],
          });
          if (id) scheduledTimers.delete(id);
        }, delay);

        if (id) scheduledTimers.set(id, timerId);
      }
      break;
    }

    case 'CANCEL_NOTIFICATION': {
      const { id } = event.data;
      if (id && scheduledTimers.has(id)) {
        clearTimeout(scheduledTimers.get(id));
        scheduledTimers.delete(id);
      }
      break;
    }

    default:
      break;
  }
});

// Handle notification click when user taps notification while app is closed or backgrounded
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionTab = event.notification.data?.actionTab || 'plans';
  const targetUrl = `/?tab=${actionTab}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post navigation event
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: actionTab, data: event.notification.data });
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
