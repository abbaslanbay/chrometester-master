'use strict';

const DURATION= 60;
const BASE_URL = "https://isu.uniteroom.com/meetings/live/"
const ROOM_ID = "51ffff87-b84b-4e0e-aa2a-c97163177ca8";
const puppeteer = require('puppeteer');
const users = require('./users');
  (async () => {
 
    console.log(users.length)
    const browser = await puppeteer.launch({
      headless: true,
      // devtools: true,
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
      page
      .on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
      .on('pageerror', ({ message }) => console.log(message))
      // .on('response', response =>
      //   console.log(`${response.status()} ${response.url()}`))
      .on('requestfailed', request =>
          console.log(`${request.failure().errorText} ${request.url()}`))
      await page.setDefaultNavigationTimeout(0);
      await page.setViewport({
              width: 1000,
              height: 700
            });
            console.log(item.email)
      await page.goto(BASE_URL+ROOM_ID);
      await page.type('#login-email',item.email);
      await page.type('#login-password', "123456789");
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
