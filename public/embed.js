// public/embed.js — v4 hard-sticky + self-heal + SPA-safe
(() => {
  const SHELL_ID = 'sasha-shell';
  const HOST_ID  = 'sasha-widget';

  const safe = (fn) => { try { return fn(); } catch {} };
  const log  = (...a) => { if (window.sashaDebug) console.log('[Sasha]', ...a); };

  function ensureHostDiv() {
    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = document.createElement('div');
      host.id = HOST_ID;
      document.body.appendChild(host);
    }
    return host;
  }

  function mount() {
    if (!document.body) return;

    // Do not double-mount
    if (document.getElementById(SHELL_ID)) return;

    const host = ensureHostDiv();
    const brand = host.getAttribute('data-brand') || 'Sasha';
    const mode  = host.getAttribute('data-mode')  || 'customer';
    const api   = host.getAttribute('data-api')   || '';

    // Outer shell (VERY visible; not pointer-events none so you can click it)
    const shell = document.createElement('div');
    shell.id = SHELL_ID;
    shell.style.position = 'fixed';
    shell.style.right = '16px';
    shell.style.bottom = '16px';
    shell.style.zIndex = '2147483647';
    document.body.appendChild(shell);

    // Shadow DOM to avoid CSS conflicts
    const root = shell.attachShadow({ mode: 'open' });

    const css = document.createElement('style');
    css.textContent = `
      .s-btn{ width:64px;height:64px;border-radius:999px;display:grid;place-items:center;
              background:#111;color:#fff;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.25);
              font:700 16px/1 system-ui; user-select:none; }
      .s-panel{ position:fixed; right:0; bottom:84px; width:min(420px,92vw); height:min(600px,84vh);
                border-radius:18px; background:#0b0b0f; color:#fff; box-shadow:0 20px 40px rgba(0,0,0,.35);
                overflow:hidden; display:none; border:2px solid #22d3ee; }
      .s-open{ display:block }
      .s-head{ padding:14px 18px; background:#141425; border-bottom:1px solid #222;
               font:700 15px/1 system-ui; display:flex; align-items:center; justify-content:space-between }
      .s-badge{ padding:3px 9px; margin-left:8px; background:#2dd4bf; color:#041313; border-radius:999px; font-size:12px }
      .s-body{ padding:14px 18px; font:400 14px/1.5 system-ui }
      .s-row{ display:flex; gap:10px; align-items:center; margin-top:12px }
      .s-primary{ padding:10px 12px; border-radius:10px; border:0; background:#22d3ee; color:#00232a; font-weight:800; cursor:pointer }

