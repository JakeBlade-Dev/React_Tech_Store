const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));

  console.log('Navigating to login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  
  await page.type('#login-email', 'jona@gmail.com');
  await page.type('#login-password', '123456');
  await page.click('button[type="submit"]');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Navigating to users...');
  await page.goto('http://localhost:5174/admin/users', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  await browser.close();
})();
