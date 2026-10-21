const { spawn } = require('child_process');
const fs = require('fs');

async function captureTicker() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9248',
    '--window-size=1280,900',
    'http://localhost:3000',
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9248/json/list');
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

    // Wait 1s and capture ticker area
    await new Promise(r => setTimeout(r, 1000));
    const snap1 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/ticker_t1.png', Buffer.from(snap1.data, 'base64'));

    await new Promise(r => setTimeout(r, 4000));
    const snap2 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/ticker_t2.png', Buffer.from(snap2.data, 'base64'));

    await new Promise(r => setTimeout(r, 5000));
    const snap3 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/ticker_t3.png', Buffer.from(snap3.data, 'base64'));

    console.log('Screenshots saved!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

captureTicker();
