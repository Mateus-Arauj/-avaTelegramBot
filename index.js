const puppeteer = require('puppeteer')
require('dotenv').config();
const Schedule = require('node-schedule');

// const rule = new Schedule.RecurrenceRule();
// rule.minute = 1;

// const job = Schedule.scheduleJob("* /1 * * * *", () => {
// console.log("olá mundo");
// });


(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://ava.uft.edu.br/palmas/login/index.php');
    await page.type('#username', process.env.LOGIN);
    await page.type('#password', process.env.SENHA);
    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation()
    ]);
    await page.screenshot({path:'example.png'})
    await page.waitForTimeout(10000);
    const {titles,datas} = await page.evaluate(() => {
        const datas = []
        const titles = []
        document.querySelectorAll(".border-bottom.pb-2 > h5").forEach((b) => {
            datas.push({ "data": b.innerText })
        })
        document.querySelectorAll(".border-bottom.pb-2 > div > div > div > div > a > h6").forEach((b) => {

            titles.push({ "title": b.innerText.replace('está marcado(a) para esta data', ':') })
        })
        return { titles, datas }
    })
    await browser.close();
})();

