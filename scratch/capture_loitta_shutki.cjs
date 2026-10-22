const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function captureLoittaShutki() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,1200',
    'http://localhost:3000/?category=shutki-balachaw'
  ]);
  await new Promise(r => setTimeout(r, 2200));

  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9294/json', (res) => {
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
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Page.enable');
    await send('Runtime.enable');
    
    // Hide sticky header and floating bar, scroll to Loitta cards
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('header').forEach(h => h.style.display = 'none');
          document.querySelectorAll('.sticky').forEach(s => s.style.position = 'static');
          const loitta = Array.from(document.querySelectorAll('h4')).find(h => h.innerText.includes('লইট্টা'));
          if (loitta) {
            loitta.scrollIntoView({ block: 'center' });
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    // Get position of loitta cards
    const cardInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const headings = Array.from(document.querySelectorAll('h4'));
          const cards = headings.filter(h => h.innerText.includes('লইট্টা'));
          
          return cards.map(h => {
            const card = h.closest('div.group') || h.parentElement.parentElement;
            const rect = card.getBoundingClientRect();
            return {
              title: h.innerText.trim(),
              text: card.innerText,
              box: {
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY,
                vx: rect.x,
                vy: rect.y,
                width: rect.width,
                height: rect.height
              }
            };
          });
        })()
      `,
      returnByValue: true
    });

    console.log('Cards found:', JSON.stringify(cardInfo.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', {
      format: 'png'
    });

    const outPath = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/loitta_shutki_viewport.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved viewport to:', outPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

captureLoittaShutki().catch(console.error);
