'use strict';

const DURATION= 60;
const MEET_URL = "https://isu.uniteroom.com/meetings/live/14ad813e-e55a-43fd-ba1a-c5d591f1b504";


const puppeteer = require('puppeteer');

  (async () => {
    const users = [
      {
        email:'llksksk@ksksk.com',
        password:'123456789'
      },
      {
        email:'haktan@bir.com',
        password:'123456789'
      },
      {
        email:'test@uniteroom.com',
        password:'123456789'
      }
    ]
    
    const browser = await puppeteer.launch({
      headless: true,
      devtools: false,
      // dumpio: true,
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--use-gl=swiftshader",
        "--disable-dev-shm-usage",
        "--use-fake-ui-for-media-stream",
        "--enable-resource-load-scheduler=false",
        "--use-fake-device-for-media-stream",
      ],
      ignoreDefaultArgs: ['--mute-audio']
    });
    const start = Date.now();
    const promises = users.map(async (item) => {
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.setViewport({
              width: 1000,
              height: 700
            });
      await page.goto(MEET_URL);
      await page.type('#login-email',item.email);
      await page.type('#login-password', item.password);
      await Promise.all([
        page.click('.btn-primary'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
      console.log(`Page took ${Date.now() - start}ms to load.`);
    });
    await Promise.all(promises);
    console.log(`Opening of 10 pages took ${Date.now() - start}ms.`);
    await sleep((DURATION + Math.random()) * 60 * 1000);
    await browser.close();
  })();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
