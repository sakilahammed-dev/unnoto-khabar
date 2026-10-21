const { spawn } = require('child_process');
const fs = require('fs');

const svgHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@700&display=swap');
  body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; }
  .bengali-text {
    font-family: 'Hind Siliguri', sans-serif;
    font-size: 27px;
    font-weight: 700;
    fill: #b91c1c;
  }
  .english-text {
    font-family: 'Hind Siliguri', sans-serif;
    font-size: 15px;
    font-weight: 700;
    fill: #064e3b;
    letter-spacing: 2.5px;
  }
</style>
</head>
<body>
<svg width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <!-- Top arc for 'বিশেষ অফার' -->
    <path id="topArc" d="M 36,120 A 84,84 0 0,1 204,120" fill="none" />
    <!-- Bottom arc for 'SPECIAL OFFERS' -->
    <path id="bottomArc" d="M 38,120 A 82,82 0 0,0 202,120" fill="none" />
  </defs>

  <!-- Arched Bengali text -->
  <text class="bengali-text">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">বিশেষ অফার</textPath>
  </text>

  <!-- Arched English text -->
  <text class="english-text">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">SPECIAL OFFERS</textPath>
  </text>
</svg>
</body>
</html>
`;

fs.writeFileSync('scratch/badge_text_overlay.html', svgHtml);

async function render() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9254',
    '--window-size=240,240',
    '--default-background-color=00000000',
    'file://' + process.cwd() + '/scratch/badge_text_overlay.html',
  ]);

  try {
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch('http://127.0.0.1:9254/json/list');
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) return;
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const cbs = new Map();
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && cbs.has(m.id)) {
        cbs.get(m.id)(m.result);
        cbs.delete(m.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise(r => {
        const cur = id++;
        cbs.set(cur, r);
        ws.send(JSON.stringify({ id: cur, method, params }));
      });
    await new Promise(r => (ws.onopen = r));
    await send('Page.enable');
    await new Promise(r => setTimeout(r, 1000));
    const snap = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('scratch/badge_text_rendered.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved badge_text_rendered.png');
    ws.close();
  } finally {
    chrome.kill();
  }
}

render();
