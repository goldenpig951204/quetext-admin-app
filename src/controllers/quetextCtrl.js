const Captcha = require("2captcha");
const {
    extractCookies
} = require("../services/utils");
const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const log = require("../services/logger");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

// const puppeteer = require("puppeteer-extra");

const login = async (req, res) => {
    let { email, password } = req.body;
    let solver = new Captcha.Solver("1cca50f7c9ce7bacaa1cb447e3ec2bbd");

    solver.recaptcha("6LcB4MsZAAAAAKbHYoExoGwF8t-TMx9kae_MT9x1", "https://www.quetext.com/login", { action: "login", version: "v2"}).then(async (result) => {
        let recaptchaToken = result.data;
        result = await axios.instance.get("https://www.quetext.com/login", {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
                "referer": "https://www.quetext.com/account/settings"
            }
        });
        let postData = 'login_email=' + email + '&login_password=' + password + '&' + 'key=20d16696&token=' + recaptchaToken + '&deviceId=d520c7a8-421b-4563-b955-f5abc56b97e9';
        let headers = [
            "authority: www.quetext.com",
            "accept: */*",
            "accept-language: en-US,en;q=0.9,ja;q=0.8",
            "content-type: application/x-www-form-urlencoded; charset=UTF-8",
            "cookie: " + extractCookies(result.headers["set-cookie"]),
            "origin: https://www.quetext.com",
            "referer: https://www.quetext.com/login",
            "sec-ch-ua: \"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
            "sec-ch-ua-mobile: ?0",
            "sec-ch-ua-platform: \"Windows\"",
            "sec-fetch-dest: empty",
            "sec-fetch-mode: cors",
            "sec-fetch-site: same-origin",
            "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
            "x-requested-with: XMLHttpRequest"
        ]

        let { data } = await axios.instance.request({
            url: 'https://scrapeninja.p.rapidapi.com/scrape',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-rapidapi-host": "scrapeninja.p.rapidapi.com",
                "x-rapidapi-key": "52b0279e45mshcdefc7bb48e92b7p1905e5jsn8bd85d9bfe80"
            },
            data: JSON.stringify({
                "url": "https://www.quetext.com/api/login",
                "method": "POST",
                "headers": headers,
                "data": postData
            })
        });
        console.log(data);
        res.json("OK")
    });
   
    // try {
    //     const windowsLikePathRegExp = /[a-z]:\\/i;
    //     let inProduction = false;
    
    //     if (! windowsLikePathRegExp.test(__dirname)) {
    //         inProduction = true;
    //     }
    //     let options = {};
    //     if (inProduction) {
    //         options = {
    //             headless : true,
    //             args: [
    //                 '--no-sandbox',
    //                 '--disable-setuid-sandbox',
    //                 '--disable-dev-shm-usage',
    //                 '--media-cache-size=0',
    //                 '--disk-cache-size=0',
    //                 '--ignore-certificate-errors',
    //                 '--ignore-certificate-errors-spki-list',
    //             ],
    //             timeout: 200000,
    //         };
    //     } else {
    //         options = {
    //             headless : false,
    //             timeout: 200000,
    //             args: [
    //                 '--ignore-certificate-errors',
    //                 '--ignore-certificate-errors-spki-list',
    //             ],
    //         };
    //     }
    //     const browser = await puppeteer.launch(options);
    //     const page = await browser.newPage();
    //     await page.goto('https://www.quetext.com/login', {waitUntil: 'load', timeout: 200000});
    //     await page.focus("#login_email").then(async () => {
    //         await page.keyboard.type(email, { delpay: 2000 });
    //     });
    //     await page.focus("#login_password").then(async () => {
    //         await page.keyboard.type(password, { delpay: 2000 });
    //     });

    //     let checkError = setInterval(async () => {
    //         const msgElm = await page.$("#form-message");
    //         if (msgElm) {
    //             let error = await (await msgElm.getProperty("textContent")).jsonValue();
    //             if (error) {
    //                 log("quetext").error(`Start session with ${email} failed: ${error}`);
    //                 res.status(500).send(error);
    //                 // await browser.close(true);
    //                 clearInterval(checkError);
    //             }
    //         } else {
    //             clearInterval(checkError);
    //         }
    //     }, 1000);
        
    //     await Promise.all([
    //         page.$eval("button.submit", elm => {
    //             elm.click();
    //         }),
    //         page.waitForNavigation({waitUntil: 'load', timeout : 200000})
    //     ]).then(async result => {
    //         let cookies = await page.cookies();
    //         // await browser.close(true);
    //         let cookie = "";
    //         for (let idx in cookies) {
    //             cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
    //         }
    //         await credentialModel.findOneAndUpdate(null, {
    //             type: "quetext",
    //             username: email,
    //             password: password
    //         }, {
    //             upsert: true
    //         });
    //         await settingModel.findOneAndUpdate(null, {
    //             quetextCookie: cookie,
    //         }, {
    //             upsert: true
    //         });
    //         log("quetext").info(`Start session with ${email} successfully.`);
    //         return res.send("Login successfully.");
    //     });
    // } catch (err) {}
}

module.exports = {
    login
};
