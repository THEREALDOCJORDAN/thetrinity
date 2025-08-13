TRINITY SAFE TEST PUBLIC

Files included:
- kill-dev-ws.js  -> Blocks dev WebSocket attempts to ws://localhost:8081 in production.
- embed.js        -> Sasha widget (self-healing, SPA-safe).
- demo.html       -> Minimal page that loads the widget (no Shopify needed).

How to use:
1) Drop ALL files into your project's public/ folder.
2) Deploy to Vercel.
3) Visit https://YOUR-VERCEL-SUBDOMAIN.vercel.app/demo.html
   - You should see the ✨ bubble and a red dashed square at bottom-right.
   - Click the bubble to open the panel.
4) Once confirmed, add to your main app page:
   <script defer src="/kill-dev-ws.js?v=1"></script>
   <script defer src="/embed.js?v=4"></script>
   <div id="sasha-widget" data-mode="customer" data-brand="ALKAMI"></div>
