const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function test() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,1100',
    'http://localhost:3000/?category=special-offers'
  ]);
  await new Promise(r => setTimeout(r, 2200));

  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9299/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Network.enable');
    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to catalog section so header is in view
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('header').forEach(h => h.style.display = 'none');
          const h1 = Array.from(document.querySelectorAll('h1')).find(h => h.innerText.includes('বিশেষ অফার'));
          if (h1) {
            h1.scrollIntoView({ block: 'start' });
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/special_offers_view_verified.png', Buffer.from(shot.data, 'base64'));
    console.log('Special offers screenshot saved!');
    ws.close();
  } finally {
    chrome.kill();
  }
}
test().catch(console.error);
