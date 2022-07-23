const puppeteer = require('puppeteer')
require('dotenv').config();
const Schedule = require('node-schedule');
const express = require('express');
const {Telegraf} = require('telegraf');
const PORT = process.env.PORT || 5000
const bot = new Telegraf(process.env.TOKEN)
const server = express()

server.all('/', (req,res)=>{
    res.send("Bot está online")
})



async function GetInfo(){
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://ava.uft.edu.br/palmas/login/index.php');
    await page.type('#username', process.env.LOGIN);
    await page.type('#password', process.env.SENHA);
    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation()
    ]);
    await page.waitForTimeout(10000);
    const {titles,datas} = await page.evaluate(() => {
        const datas = []
        const titles = []
        document.querySelectorAll(".border-bottom.pb-2 > h5").forEach((b) => {
            datas.push({ "data": b.innerText })
        })
        document.querySelectorAll(".border-bottom.pb-2 > div > div > div > div > a > h6").forEach((b) => {
            
            titles.push({ "title": b.innerText.replace('está marcado(a) para esta data', '.') })
        })
        return { titles, datas }
    })
    await page.goto('https://ava.uft.edu.br/palmas/login/index.php');
    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation()
    ]);
    await browser.close();
    list = ''
    datas.forEach((t,index)=>{
        list += `Data: ${t.data}\nDescrição: ${titles[index].title}\n\n`
    })
    return list
}

bot.start(content => {
    const from = content.update.message.from

    console.log(from)
    content.reply(`Muito bem-vindo, ${from.first_name}!`)
    content.reply("As atividades serão enviadas todo dia a partir das 08h, envie 'registrar' para começar:")
})
bot.command("registrar", (content, next)=>{
   //console.log(content.update.message)
   
    console.log(content)

    const job = Schedule.scheduleJob(`00 ${process.env.minutos} ${process.env.hora} * * 0-6`, () => {
        GetInfo().then(r => content.telegram.sendMessage(content.message.chat.id, r))
        // content.telegram.sendMessage(content.message.chat.id, r
    });
 
}
)

bot.startPolling()
server.listen(PORT)