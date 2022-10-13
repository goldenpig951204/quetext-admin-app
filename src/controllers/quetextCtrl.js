const credentialModel = require("../models/credential");
const settingModel = require("../models/setting");
const log = require("../services/logger");
const { get } = require("lodash");

const puppeteer = require("puppeteer-extra");

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        const windowsLikePathRegExp = /[a-z]:\\/i;
        let inProduction = false;
    
        if (! windowsLikePathRegExp.test(__dirname)) {
            inProduction = true;
        }
        let options = {};
        if (inProduction) {
            options = {
                headless : true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--media-cache-size=0',
                    '--disk-cache-size=0',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
                timeout: 100000,
            };
        } else {
            options = {
                headless : false,
                timeout: 100000,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto('https://www.quetext.com/login', {waitUntil: 'load', timeout: 100000});
        await page.focus("#login_email").then(async () => {
            await page.keyboard.type(email, { delpay: 100 });
        });
        await page.focus("#login_password").then(async () => {
            await page.keyboard.type(password, { delpay: 100 });
        });

        let checkError = setInterval(async () => {
            const msgElm = await page.$("#form-message");
            if (msgElm) {
                let error = await (await msgElm.getProperty("textContent")).jsonValue();
                if (error) {
                    log("quetext").error(`Start session with ${email} failed: ${error}`);
                    res.status(500).send(error);
                    await browser.close(true);
                    clearInterval(checkError);
                }
            } else {
                clearInterval(checkError);
            }
        }, 1000);
        
        await Promise.all([
            page.$eval("button.submit", elm => {
                elm.click();
            }),
            page.waitForNavigation({waitUntil: 'load', timeout : 100000})
        ]).then(async result => {
            let cookies = await page.cookies();
            await browser.close(true);
            let cookie = "";
            for (let idx in cookies) {
                cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
            }
            await credentialModel.findOneAndUpdate(null, {
                type: "quetext",
                username: email,
                password: password
            }, {
                upsert: true
            });
            await settingModel.findOneAndUpdate(null, {
                quetextCookie: cookie,
            }, {
                upsert: true
            });
            log("quetext").info(`Start session with ${email} successfully.`);
            return res.send("Login successfully.");
        });
    } catch (err) {}
}

module.exports = {
    login
};
