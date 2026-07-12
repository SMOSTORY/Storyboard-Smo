const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => {
    console.log('ALERT:', dialog.message());
    await dialog.accept();
    await browser.close();
    process.exit(0);
  });
  
  await page.goto('http://localhost:3000');
  
  await page.waitForSelector('.board-page', { timeout: 10000 });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const menuBtn = btns.find(b => b.innerHTML.includes('Menu') || b.textContent.includes('Menu'));
    if (menuBtn) menuBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bookBtn = btns.find(b => b.textContent.includes('Book edit'));
    if (bookBtn) bookBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fileBtn = btns.find(b => b.innerHTML.includes('File') || b.textContent.includes('File'));
    if (fileBtn) fileBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exportBtn = btns.find(b => b.textContent.includes('Export Book as PDF'));
    if (exportBtn) exportBtn.click();
  });
  
  console.log('Clicked export, waiting for alert...');
  
  await new Promise(r => setTimeout(r, 10000));
  console.log('Timeout waiting for alert');
  await browser.close();
  process.exit(0);
})();
