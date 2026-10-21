const { spawn } = require('child_process');
const fs = require('fs');

async function capture() {
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9247',
    '--window-size=1280,900',
    'http://localhost:3000',
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch('http://127.0.0.1:9247/json/list');
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

    // Wait for initial render of Slide 1
    await new Promise(r => setTimeout(r, 1200));
    const snapSlide1 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/slider_slide1_desktop.png', Buffer.from(snapSlide1.data, 'base64'));
    console.log('Saved slider_slide1_desktop.png');

    // Click Next chevron to slide to Slide 2
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.getAttribute('aria-label') === 'পরবর্তী ব্যানার');
        if (nextBtn) nextBtn.click();
      `,
    });

    // Wait for spring transition animation to complete
    await new Promise(r => setTimeout(r, 1200));
    const snapSlide2 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/slider_slide2_desktop.png', Buffer.from(snapSlide2.data, 'base64'));
    console.log('Saved slider_slide2_desktop.png');

    // Mobile Viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise(r => setTimeout(r, 800));
    const snapMobileSlide2 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/slider_slide2_mobile.png', Buffer.from(snapMobileSlide2.data, 'base64'));
    console.log('Saved slider_slide2_mobile.png');

    // Switch back to Slide 1 on mobile
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const prevBtn = btns.find(b => b.getAttribute('aria-label') === 'পূর্ববর্তী ব্যানার');
        if (prevBtn) prevBtn.click();
      `,
    });
    await new Promise(r => setTimeout(r, 1000));
    const snapMobileSlide1 = await send('Page.captureScreenshot');
    fs.writeFileSync('scratch/slider_slide1_mobile.png', Buffer.from(snapMobileSlide1.data, 'base64'));
    console.log('Saved slider_slide1_mobile.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture();
