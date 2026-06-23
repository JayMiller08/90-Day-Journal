const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('EXCEPTION:', error.message);
  });

  console.log("Navigating...");
  await page.goto('http://localhost:5176/onboarding', { waitUntil: 'networkidle2' });
  
  console.log("Clicking Sign Up with Email...");
  const [btn] = await page.$x("//button[contains(., 'Sign Up with Email')]");
  if (btn) await btn.click();
  
  console.log("Typing details...");
  await page.type('input[type="text"]', 'testuser99'); // Username
  const inputs = await page.$$('input[type="text"]');
  // Form fields in step 1: First Name, Last Name, Username, Email, Password
  // Let's just use page.evaluate to fill them
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs[0].value = 'TestFirst'; // First name
    inputs[1].value = 'TestLast'; // Last name
    inputs[2].value = 'testuser99'; // Username
    inputs[3].value = 'test99@example.com'; // Email
    inputs[4].value = 'password123'; // Password
    
    // dispatch change events
    inputs.forEach(input => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  console.log("Clicking Continue...");
  const [continueBtn] = await page.$x("//button[contains(., 'Continue')]");
  if (continueBtn) await continueBtn.click();

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
