// kill-dev-ws.js — blocks localhost dev WebSockets in production
(() => {
  const isProd = !['localhost', '127.0.0.1'].includes(location.hostname);
  if (!isProd) return;
  const OriginalWS = window.WebSocket;
  window.WebSocket = new Proxy(OriginalWS, {
    construct(target, args) {
      const url = String(args?.[0] ?? '');
      if (url.includes('localhost:8081')) {
        console.warn('[kill-dev-ws] Blocked WebSocket connection to', url);
        return { readyState: 3, close() {}, send() {}, addEventListener() {}, removeEventListener() {},
                 onopen: null, onmessage: null, onerror: null, onclose: null };
      }
      return new target(...args);
    }
  });
})();