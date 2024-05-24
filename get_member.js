const puppeteer = require('puppeteer')

const fs = require('fs')
const { flatten } = require('lodash')

const json2csv = require('json2csv').parse

function wait(time) {
  return new Promise(r => {
    setTimeout(r, time)
  })
}
