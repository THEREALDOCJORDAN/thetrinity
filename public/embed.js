// public/embed.js  — conflict-safe v2
(() => {
  // Never crash the page
  const safe = (fn) => { try { return fn(); } catch(e) { /* silent */ } };

  const ready = (fn) => {
    (document.readyState === 'loading')
      ? document.addEventListener('DOMContentLoaded', () => safe(fn))
      : safe(fn);
  };

  ready(() => {
    // Read config from host div (if present)
    let hostDiv = document.getElementById('sasha-widget');
    if (!hostDiv) { hostDiv = document.createElement('div'); hostDiv.id = 'sasha-widget'; document.body.appendChild(hostDiv); }

    const brand = hostDiv.getAttribute('data-brand') || 'Sasha';
    const mode  = hostDiv.getAttribute('data-mode')  || 'customer';
    const api   = hostDiv.getAttribute('data-api')   || '';

    // Mount container (highest z-index, no page styles touched)
    const shell = document.createElement('div');
    shell.setAttribute('data-sasha', '1');
    shell.style.position = 'fixed';
    shell.style.right = '16px';
    shell.style.bottom = '16px';
    shell.style.zIndex = '2147483647';
    shell.style.pointerEvents = 'none'; // do not block page except our own UI
    document.body.appendChild(shell);

    // Shadow DOM to isolate CSS
    const root = shell.attachShadow({ mode: 'open' });

    // Styles — namespaced, no globals
    const css = document.createElement('style');
    css.textContent = `
      .s-btn { pointer-events:auto; width:56px;height:56px;border-radius:999px;
        display:grid;place-items:center;background:#111;color:#fff;cursor:pointer;
        box-shadow:0 10px 25px rgba(0,0,0,.25); font:600 14px/1 system-ui; user-select:none; }
      .s-panel { pointer-events:auto; position:fixed; right:0; bottom:72px;
        width:min(380px,90vw); height:min(560px,80vh); border-radius:16px;
        background:#0b0b0f; color:#fff; box-shadow:0 20px 40px rgba(0,0,0,.35);
        overflow:hidden; display:none; }
      .s-open { display:block; }
      .s-head { padding:12px 16px; background:#141425; border-bottom:1px solid #222;
        font:600 14px/1 system-ui; display:flex; align-items:center; justify-content:space-between; }
      .s-badge { padding:2px 8px; margin-left:8px; background:#2dd4bf; color:#041313;
        border-radius:999px; font-size:11px; }
      .s-body { padding
