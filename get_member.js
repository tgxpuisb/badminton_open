const puppeteer = require('puppeteer')

const fs = require('fs')
const { flatten } = require('lodash')

const json2csv = require('json2csv').parse

function wait(time) {
  return new Promise(r => {
    setTimeout(r, time)
  })
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false
  })

  await page.goto('http://account.zhongyulian.com/?menu=login')

  await page.type('#phone_input', account)
  await page.type('#phone_password', pwd)

  await page.waitForSelector('.rtitle .ui', { timeout: 0})

  
}
