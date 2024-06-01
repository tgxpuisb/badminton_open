const puppeteer = require('puppeteer')
const fs = require('fs')
const { flatten, isEmpty } = require('lodash')
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

  await page.goto('http://account.zhongyulian.com/?menu=login', { timeout: 0 })

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
  for (let i = 15; i <= 23; i++) {
    // const i = 6
    const competitions = require(`./competitions/res-${i}.json`)
    console.log(competitions)
    for (let j = i === 15 ? 85 : 0; j < competitions.length; j++) {

        const cid = competitions[j].cid
        const name = competitions[j].name
        const startTime = competitions[j].startTime
        console.log(`开始爬 competitions_${i}的第${j}条数据, cid:${cid}`)

        await page.goto(`http://ycyl.zhongyulian.com/admin.php?a=internalmanage&id=${cid}`, { timeout: 0 })

        await wait(500)
        await page.waitForSelector('#joinMgrFrom', { timeout: 0 })
        await wait(500)
      
        const idsMap = await page.$$eval('#joinMgrFrom table tbody tr', els => {
          if (els.length < 2) {
            return undefined
          }
          const map = {}
          // return els.map(el => el.children[2].textContent.trim())
          els.forEach(el => {
              const id = el.children[2].textContent.trim()
              const name = el.children[1].textContent.trim()
              map[name] = id
          })
      
          return map
        })
        if (isEmpty(idsMap)) {
          continue;
        }
        console.log(idsMap)
      
        await page.goto(`http://ycyl.zhongyulian.com/admin.php?a=internalmanage&menu=result&id=${cid}`, { timeout: 0 })
        await wait(500)
        await page.waitForSelector('#groupMgrFrom', { timeout: 0 })
        await wait(500)
      
        const result = await page.$$eval('#groupMgrFrom .container .row .scheduleitem', els => {
          const matchs = []
          if (els.length < 2) {
            return undefined
          }
          els.forEach(el => {
              const idMatch = el.outerHTML.match(/adminInternalScheduleEditor\('([a-z,A-Z,0-9]+?)'\)/)
              if (!idMatch || !idMatch[1]) return
              const children = el.children
              const t1 = children[1].textContent.split('、')
              const t2 = children[3].textContent.split('、')
              const scores = children[2].textContent.split(':')
              matchs.push({
                  id: idMatch[1],
                  t1,
                  t2,
                  scores,
              })
          })
      
          return matchs
        })
        if (isEmpty(result)) {
          continue
        }
      
        const data = result.map(res => {
          const { t1, t2, scores, id } = res
          return {
              cid,
              name,
              startTime,
              id,
              p1: idsMap[t1[0]],
              p2: idsMap[t1[1]],
              t1_score: scores[0],
              p3: idsMap[t2[0]],
              p4: idsMap[t2[1]],
              t2_score: scores[1],
          }
        })
      
        // console.log(data)
        fs.writeFileSync(`./matchs/${cid}.json`, JSON.stringify(data, undefined, 2), 'utf-8')

    }
  }

  browser.close()
}

if (require.main === module) {
  main()
}


// http://ycyl.zhongyulian.com/admin.php?a=internalmanage&id=665860f5c0e88c35548b6905