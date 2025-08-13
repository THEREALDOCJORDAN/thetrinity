// public/embed.js
(() => {
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  ready(() => {
    // Find or create mount div
    let hostDiv = document.getElementById('sasha-widget');
    if (!hostDiv) { hostDiv = document.createElement('div'); hostDiv.id = 'sasha-widget'; document.body.appendChild(hostDiv); }

    const brand = hostDiv.getAttribute('data-brand') || 'Sasha';
    const mode  = hostDiv.getAttribute('data-mode')  || 'customer';
    const api   = hostDiv.getAttribute('data-api')   || '';  // e.g. https://your-backend.com

    // Create shadow DOM so theme CSS won't collide
    const shell = document.createElement('div');
    shell.style.position = 'fixed';
    shell.style.inset = 'auto 16px 16px auto';
    shell.style.zIndex = '2147483647';
    const root = shell.attachShadow({ mode: 'open' });
    document.body.appendChild(shell);

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      .btn{width:56px;height:56px;border-radius:999px;display:grid;place-items:center;background:#111;color:#fff;
           cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.25);font:600 14px/1 system-ui;}
      .panel{position:fixed;right:0;bottom:72px;width:min(380px,90vw);height:min(560px,80vh);border-radius:16px;
             background:#0b0b0f;color:#fff;box-shadow:0 20px 40px rgba(0,0,0,.35);overflow:hidden;display:none;}
      .open{display:block;}
      header{padding:12px 16px;background:#141425;font:600 14px/1 system-ui;border-bottom:1px solid #222;}
      .badge{padding:2px 8px;margin-left:8px;background:#2dd4bf;color:#041313;border-radius:999px;font-size:11px;}
      .body{padding:12px 16px;font:400 13px/1.5 system-ui;}
      .row{display:flex;gap:8px;align-items:center;margin-top:10px;}
      .input{flex:1;border-radius:10px;border:1px solid #2a2a3d;background:#0f0f1a;color:#e6f7ff;padding:8px 10px;}
      .primary{padding:10px 12px;border-radius:10px;border:0;background:#22d3ee;color:#00232a;font-weight:700;cursor:pointer;}
      .muted{opacity:.85;margin-top:8px;font-size:12px}
    `;
    root.appendChild(style);

    // UI
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <header>${brand} Assistant <span class="badge">${mode}</span></header>
      <div class="body">
        <div>I'm live on your store. Try a quick check:</div>
        <div class="row">
          <button class="primary" id="btn-health">Check connection</button>
          <button class="primary" id="btn-close" style="background:#a78bfa;color:#120b2a">Close</button>
        </div>
        <div id="log" class="muted">No backend set yet.</div>
      </div>
    `;
    root.appendChild(panel);

    const btn = document.createElement('div');
    btn.className = 'btn';
    btn.innerHTML = '✨';
    root.appendChild(btn);

    btn.addEventListener('click', () => panel.classList.toggle('open'));
    panel.querySelector('#btn-close').addEventListener('click', () => panel.classList.remove('open'));

    const log = panel.querySelector('#log');
    panel.querySelector('#btn-health').addEventListener('click', async () => {
      if (!api){ log.textContent = 'Frontend good ✅ — set data-api later for backend checks.'; return; }
      try{
        const r = await fetch(`${api.replace(/\/$/,'')}/health`, {credentials:'omit'});
        log.textContent = r.ok ? 'Backend connected ✅' : `Backend responded ${r.status}`;
      }catch(e){ log.textContent = 'Could not reach backend ❌'; }
    });
  });
})();
