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
    if (document.getElementById(SHELL_ID)) return;

    const host = ensureHostDiv();
    const brand = host.getAttribute('data-brand') || 'Sasha';
    const mode  = host.getAttribute('data-mode')  || 'customer';
    const api   = host.getAttribute('data-api')   || '';

    const shell = document.createElement('div');
    shell.id = SHELL_ID;
    shell.style.position = 'fixed';
    shell.style.right = '16px';
    shell.style.bottom = '16px';
    shell.style.zIndex = '2147483647';
    document.body.appendChild(shell);

    const root = shell.attachShadow({ mode: 'open' });
    const css = document.createElement('style');
    css.textContent = `
      .s-btn{ width:64px;height:64px;border-radius:999px;display:grid;place-items:center;
              background:#111;color:#fff;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.25);
              font:700 16px/1 system-ui; user-select:none }
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
      .s-ghost{ padding:8px 10px; border-radius:8px; border:1px solid #333; background:#161627; color:#fff; cursor:pointer }
      .s-log{ opacity:.9; margin-top:10px; font-size:12px }
      .debug-ring{ position:fixed; right:8px; bottom:8px; width:80px; height:80px; border:2px dashed #ff5a5a; border-radius:14px; pointer-events:none; }
    `;
    root.appendChild(css);

    const panel = document.createElement('div');
    panel.className = 's-panel';
    panel.innerHTML = `
      <div class="s-head">
        <div>${brand} <span class="s-badge">${mode}</span></div>
        <button class="s-ghost" id="s-close">Close</button>
      </div>
      <div class="s-body">
        <div>Widget mounted. Use the check below.</div>
        <div class="s-row">
          <button class="s-primary" id="s-health">Check connection</button>
        </div>
        <div id="s-log" class="s-log">Frontend loaded.</div>
      </div>
    `;
    root.appendChild(panel);

    const btn = document.createElement('div');
    btn.className = 's-btn';
    btn.textContent = '✨';
    root.appendChild(btn);

    const ring = document.createElement('div');
    ring.className = 'debug-ring';
    root.appendChild(ring);

    const logEl = panel.querySelector('#s-log');
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    const open = () => panel.classList.add('s-open');
    const close = () => panel.classList.remove('s-open');

    btn.addEventListener('click', (e) => { stop(e); panel.classList.toggle('s-open'); }, { passive:true });
    panel.querySelector('#s-close').addEventListener('click', (e) => { stop(e); close(); }, { passive:true });

    panel.querySelector('#s-health').addEventListener('click', async (e) => {
      stop(e);
      if (!api) { logEl.textContent = 'Frontend good ✅ — set data-api later.'; return; }
      try {
        const r = await fetch(`${api.replace(/\/$/,'')}/health`, { credentials:'omit' });
        logEl.textContent = r.ok ? 'Backend connected ✅' : `Backend responded ${r.status}`;
      } catch {
        logEl.textContent = 'Could not reach backend ❌';
      }
    }, { passive:true });

    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); }, { passive:true });
    log('mounted');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => safe(mount));
  } else {
    safe(mount);
  }

  const mo = new MutationObserver(() => {
    if (!document.getElementById(SHELL_ID)) {
      log('remounting after removal');
      safe(mount);
    }
  });
  safe(() => mo.observe(document.documentElement, { childList: true, subtree: true }));

  ['pushState', 'replaceState'].forEach((m) => {
    const orig = history[m];
    history[m] = function() { const r = orig.apply(this, arguments); setTimeout(() => safe(mount), 50); return r; };
  });
  window.addEventListener('popstate', () => safe(mount));
})();
