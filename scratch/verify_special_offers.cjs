const { spawn } = require('child_process');
const fs = require('fs');

async function testSpecialOffers() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9250',
    '--window-size=1280,1000',
    'http://localhost:3000',
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9250/json/list');
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

    // 1. Scroll to OfferZone on homepage
    await send('Runtime.evaluate', {
      expression: `
        const el = document.getElementById('offer-zone-section');
        if (el) el.scrollIntoView();
      `,
    });
    await new Promise(r => setTimeout(r, 1200));
    const snapHome = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/verify_home_offerzone.png', Buffer.from(snapHome.data, 'base64'));
    console.log('Saved verify_home_offerzone.png');

    // 2. Click "বিশেষ অফার" in top navbar
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const offerBtn = btns.find(b => b.textContent.includes('বিশেষ অফার'));
        if (offerBtn) offerBtn.click();
      `,
    });
    await new Promise(r => setTimeout(r, 1200));
    const snapCat = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/verify_category_special_offers.png', Buffer.from(snapCat.data, 'base64'));
    console.log('Saved verify_category_special_offers.png');

    // 3. Mobile View of special offers category
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise(r => setTimeout(r, 800));
    const snapMobile = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/verify_mobile_special_offers.png', Buffer.from(snapMobile.data, 'base64'));
    console.log('Saved verify_mobile_special_offers.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testSpecialOffers();
