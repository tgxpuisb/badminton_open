const fs = require('fs')
const json2csv = require('json2csv').parse

const competitions = require('./competitions/output.json')

let data = []

competitions.forEach(c => {
    const cid = c.cid
    if (fs.existsSync(`./matchs/${cid}.json`)) {
        const res = require(`./matchs/${cid}.json`)
        data = data.concat(res)
    }
})

fs.writeFileSync('./matchs/output.json', JSON.stringify(data, undefined, 2), 'utf-8')

let csv

try {
    csv = json2csv(data)
} catch (err) {
    console.log(err)
}

fs.writeFileSync('./matchs/output.csv', csv, 'utf-8')