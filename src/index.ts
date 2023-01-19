import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Parser } from 'binary-parser'

const dir = "C:\\Games\\ROK\\save\\mailcache"

const strToken = new Parser()
.endianess('little')
.uint32('length')
.string('name', { length: 'length'})
.uint8('sep')

const mailScene = new Parser()
.uint32le('length')
.string('name', { length: 'length' })
.uint8('etx')
.uint64('value')
.uint8('eot')

const type = new Parser()
.uint32le('strLen')
.string('name', { length: 'strLen' })
.uint8('eot', { assert: 4 })
.uint32le('typeLen')
.string('value', { length: 'typeLen' })
.uint8('eot', { assert: 4 })

const body = new Parser()
.uint32le('strLen')
.string('name', { length: 'strLen' })
.uint8('type')
.uint8('eot')


const mailStart = new Parser()
.buffer('header', { length: 10 })
.uint8('headerSep')
.nest("mailScene", { type: strToken, assert: (v: any) => v.name == "mailScene" })
.uint64('mailSceneValue', { assert: 0 })
.uint8('eot')

try {
    const files = await fs.readdir(dir)
    const types = new Set()
    const token = new Set()
    for (const fname of files) {
        if (!fname.startsWith('Persistent.Mail.')) continue
        const fpath = path.join(dir, fname)
        const fdata = await fs.readFile(fpath, null)

        console.log(fname)
        console.log(fdata)
        const result = mailStart.parse(fdata)
        console.log(result)
    }
    console.log(types)
    console.log(token)
} catch (err) {
    console.error(err)
}