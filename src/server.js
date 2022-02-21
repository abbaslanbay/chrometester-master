'use strict';
const express = require('express')
const app = express()
const port = 8085
const fs = require('fs');

const puppeteer = require('puppeteer');
const lkapi = require('livekit-server-sdk');

app.use(express.json({
    limit: '50mb'
  }));
  app.use(express.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
  }));
  
const path = "./src/config.json";


  let LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_HOST,LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning;



app.get("/",(req,res) => {
    let configData = fs.readFileSync(path);
    let config = JSON.parse(configData);
    const { LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning} = config;

    return  res.end(JSON.stringify({LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning}));

})

app.post("/changeValues",(req,res) => {

    const {  LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_HOST,LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning} = req.body;
    const data = {LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_HOST,LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning};
    const all = JSON.stringify(data);
    fs.writeFileSync(path, all);
    return  res.end(JSON.stringify({LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning}));

})


function getConfigs(){
    let configData = fs.readFileSync(path);
    let config = JSON.parse(configData);
    LIVEKIT_API_KEY = config.LIVEKIT_API_KEY;
    LIVEKIT_API_SECRET = config.LIVEKIT_API_SECRET;
    LIVEKIT_HOST = config.LIVEKIT_HOST;
    LIVEKIT_ROOM = config.LIVEKIT_ROOM;
    DURATION = config.DURATION
    LIVEKIT_IDENTITY_PREFIX = config.LIVEKIT_IDENTITY_PREFIX;
    ENABLE_PUBLISH = config.ENABLE_PUBLISH;
    TABS = config.TABS;
    IsRunning= config.IsRunning;
    return {LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_HOST,LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning};
}


;(async () => { 
    const {LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_HOST,LIVEKIT_ROOM,DURATION,LIVEKIT_IDENTITY_PREFIX,ENABLE_PUBLISH,TABS,IsRunning} = getConfigs();
    
    if(IsRunning == 1){
        console.log("running now")
        let identityPrefix = LIVEKIT_IDENTITY_PREFIX
        if (!identityPrefix) {
            identityPrefix = "tester"
        }

        let roomName = LIVEKIT_ROOM

        let testerMinutes = parseInt(DURATION)
        if (!testerMinutes) {
            testerMinutes = 30
        }
        console.log(testerMinutes)
        let enablePublish = 0
        if (ENABLE_PUBLISH) {
            enablePublish = 1
        }

        let tabCount = parseInt(TABS)
            if (!tabCount) {
            tabCount = 1
        }

        const browser = await puppeteer.launch({
            headless: true,
            // dumpio: true,
            args: [
            "--disable-gpu",
            "--no-sandbox",
            "--use-gl=swiftshader",
            "--disable-dev-shm-usage",
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            ],
            ignoreDefaultArgs: ['--mute-audio']
        });

        for (var i = 0; i < tabCount; i++) {
            const identity = `${identityPrefix}${Math.floor(Math.random() * 10000)}`

            const at = new lkapi.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: identity,
            ttl: '1h',
            });
            at.addGrant({
            room: roomName,
            roomJoin: true,
            })

            const url = `https://example.livekit.io/#/room?url=${encodeURIComponent(LIVEKIT_HOST)}&token=${at.toJwt()}&videoEnabled=${enablePublish}&audioEnabled=${enablePublish}&simulcast=${enablePublish}`
            const page = await browser.newPage();
            page
            .on('console', message =>
                console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
            .on('pageerror', ({ message }) => console.log(message))
            // .on('response', response =>
            //   console.log(`${response.status()} ${response.url()}`))
            .on('requestfailed', request =>
                console.log(`${request.failure().errorText} ${request.url()}`))
            
            await page.setViewport({
            width: 1000,
            height: 700
            });
            await page.goto(url, {waitUntil: 'load', timeout: 0});
        }

        await sleep((testerMinutes + Math.random()) * 60 * 1000);
        await browser.close();

    }else{
        console.log("don't running ")
    }
  
})();




function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
})