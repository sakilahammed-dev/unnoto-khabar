const { spawn } = require('child_process');
const fs = require('fs');

async function capture() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9244',
    '--window-size=1280,900',
    'http://localhost:3000',
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch('http://127.0.0.1:9244/json/list');
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) {
      console.error('No page target found');
      return;
    }
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

    // Wait for Next.js to render image
    await new Promise(r => setTimeout(r, 1500));

    // Capture Desktop View
    const snapDesktop = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/preview_desktop_banner_v4.png', Buffer.from(snapDesktop.data, 'base64'));
    console.log('Saved scratch/preview_desktop_banner_v4.png');

    // Set Mobile Viewport (iPhone 14 / modern smartphone)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise(r => setTimeout(r, 1000));
    const snapMobile = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/preview_mobile_banner_v4.png', Buffer.from(snapMobile.data, 'base64'));
    console.log('Saved scratch/preview_mobile_banner_v4.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture();
