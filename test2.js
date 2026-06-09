const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  console.log('Navigating to http://localhost:5174/login');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  
  console.log('Typing credentials...');
  await page.type('#login-email', 'jona@gmail.com');
  await page.type('#login-password', '123456'); // Trying simple password
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  // Wait a bit to see what happens
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Current URL after login:', page.url());
  
  await browser.close();
})();
