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
  const allPages = 30 // todo
  const startPage = 1
  const selector = '#CompetitionListForm > table tbody tr'
  const results = []

  for (let i = startPage; i <= allPages; i++) {

    await page.goto(`http://ycyl.zhongyulian.com/admin.php?ap=p8&pp=100${i > 1 ? `&cp=${i}` : ''}`, { timeout: 0 })

    await wait(15000)
    await page.waitForSelector('#CompetitionListForm', { timeout: 0 })
    await wait(15000)

    // evaluate
    const result = await page.$$eval(selector, els => {
      const list = []
      els.forEach(el => {
        const children = el.children
        list.push({
          name: children[0].textContent,
          cid: children[5].firstChild.href.replace(/.+&id=/, ''),
          startTime: children[3].textContent
        })
      })
      return list
    })

    await wait(3000)

    fs.writeFileSync(`./competitions/res-${i}.json`, JSON.stringify(result, undefined, 2), 'utf-8')

    results.push(result)
  }
  
  let csv

  try {
    csv = json2csv(flatten(results))
  } catch (err) {
    console.log(err)
  }

  fs.writeFileSync('./competitions/output.csv', csv, 'utf-8')

  browser.close()
}

if (require.main === module) {
  main()
}
