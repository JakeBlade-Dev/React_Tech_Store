const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Catch all console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  
  // Catch page errors
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  console.log('Navigating to http://localhost:5174/login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  
  console.log('Typing credentials...');
  await page.type('#login-email', 'jona@gmail.com');
  await page.type('#login-password', '123456'); // Wait, I don't know the password.
  // Actually, I just need to see if it renders!
  
  await browser.close();
})();
