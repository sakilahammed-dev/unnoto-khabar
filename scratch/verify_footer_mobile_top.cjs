const { spawn } = require('child_process');
const fs = require('fs');

async function testMobileFooterTop() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9252',
    '--window-size=390,844',
    'http://localhost:3000',
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9252/json/list');
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    // Scroll directly to the footer element top
    await send('Runtime.evaluate', {
      expression: `
        const footer = document.querySelector('footer');
        if (footer) footer.scrollIntoView();
      `,
    });
    await new Promise(r => setTimeout(r, 1000));
    const snap = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/verify_footer_mobile_logo.png', Buffer.from(snap.data, 'base64'));
    console.log('Mobile footer logo snap saved');

    ws.close;
  } finally {
    chrome.kill();
  }
}

testMobileFooterTop();
