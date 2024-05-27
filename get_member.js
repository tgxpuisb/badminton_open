const puppeteer = require('puppeteer')
const fs = require('fs')
const { flatten } = require('lodash')
const json2csv = require('json2csv').parse
const { account, password } = require('./account')

function wait(time) {
  return new Promise(r => {
    setTimeout(r, time)
  })
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1366,
    height: 768
  })

  await page.goto('http://account.zhongyulian.com/?menu=login')

  await page.type('#phone_input', account)
  await page.type('#phone_password', password)

  await page.click('#message_LOGIN_IMMEDIATELY')

  await page.waitForSelector('.rtitle .ui', { timeout: 0 })

  const titleElement = await page.$eval('.rtitle .ui', el => el.textContent)

  if (!titleElement.includes('lyz')) {
    console.log('error 登录失败')
    return await browser.close()
  }
  
  // login success

  // 开始爬数据
  const allPages = 30
  const startPage = 1
  const selector = '#MemberEditor>table tbody td:nth-child(3) table tbody tr'

  for (let i = startPage; i <= allPages; i++) {

    await page.goto(`http://ycyl.zhongyulian.com/admin.php?a=memberlist&pp=100${i > 1 ? `&cp=${i}` : ''}`, { timeout: 0 })

    await wait(15000)
    await page.waitForSelector('#MemberEditor', { timeout: 0 })
    await wait(15000)

    // evaluate

  }
}

if (require.main === module) {
  main()
}
