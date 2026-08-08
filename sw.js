/* ============================================================
   sw.js — Service Worker
   網頁關掉之後它還活著，負責接推播、跳通知、處理點擊
   ⚠️ 必須跟 index.html 放同一層，路徑錯了整個推播就不會動
   ============================================================ */

// 安裝好就立刻接管，不用等所有分頁關掉
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* 收到推播 */
self.addEventListener('push', (event) => {
  let data = { title: '任務板', body: '', url: '/Game/index.html' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // 萬一送來的不是 JSON，至少把文字顯示出來，不要整個吞掉
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon:  '/Game/assets/icon-192.png',   // 沒有這張圖也不會壞，只是沒圖示
      badge: '/Game/assets/icon-192.png',
      data:  { url: data.url },
      vibrate: [80, 40, 80],
      // 同一個 tag 的通知會互相取代，避免洗版
      tag: data.tag || 'taskboard',
    })
  );
});

/* 點通知 → 有開著的分頁就切過去，沒有就開新的 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/Game/index.html';

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.includes('/Game/') && 'focus' in c) {
        await c.focus();
        if ('navigate' in c) await c.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
