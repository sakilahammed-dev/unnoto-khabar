const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function captureMaryamDates() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9283',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,1000',
    'http://localhost:3000/?category=dates'
  ]);
  await new Promise(r => setTimeout(r, 2200));

  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9283/json', (res) => {
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
    
    // Hide sticky header and floating bar, scroll to Maryam Dates
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.querySelectorAll('header').forEach(h => h.style.display = 'none');
          document.querySelectorAll('.sticky').forEach(s => s.style.position = 'static');
          const maryam = Array.from(document.querySelectorAll('h4')).find(h => h.innerText.includes('মরিয়ম'));
          if (maryam) {
            maryam.scrollIntoView({ block: 'center' });
          }
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    // Get position of the maryam dates cards
    const cardInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const headings = Array.from(document.querySelectorAll('h4'));
          const maryamCards = headings.filter(h => h.innerText.includes('মরিয়ম'));
          
          return maryamCards.map(h => {
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

    console.log('Cards:', JSON.stringify(cardInfo.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', {
      format: 'png'
    });

    const outPath = '/home/assdi/.gemini/antigravity/brain/b2f24863-ebf9-4482-a180-c7f6a4ce986f/maryam_dates_viewport.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved viewport to:', outPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

captureMaryamDates().catch(console.error);
