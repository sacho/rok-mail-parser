import * as fs from "node:fs/promises"
import * as path from "node:path"
import { Parser } from "binary-parser"

const dir = "data/logs_1"

const strToken = new Parser()
.uint32le("length")
.string("value", { length: "length" })

const strToken04 = new Parser()
.endianess("little")
.uint32("length")
.string("name", { length: "length"})
.uint8("sep")

const headerParser = new Parser()
.buffer("unknownValue", { length: 10 })
.uint8("sep")

const mailSceneParser = new Parser()
.uint32le("length")
.string("name", { length: "length" })
.uint8("etx")
.uint64("value")
.uint8("eot")

const typeOrSenderParser = new Parser()
.nest("key", { type: strToken04 } )
.nest("value", { type: strToken04 })


const classificator = new Parser()
.nest("header", { type: headerParser })
.nest("mailScene", { type: mailSceneParser })
.nest("typeOrSender", { type: typeOrSenderParser })
.saveOffset("offset")


const strToken0504 = new Parser()
.uint32le("length")
.string("name", { length: "length" })
.uint8("enq")
.uint8("eot")


const isSOCTag = new Parser()
.nest("tag", { type: strToken })
.uint16("value")
.uint8("eot")

const IDToken = new Parser()
.nest("", { type: strToken04 })
.uint64le("value")
.uint8("eot")

const participantParser = new Parser()
.nest("StringId", { type: strToken0504 })
.nest("Abbr", { type: strToken04 })
.nest("AllianceTag", { type: strToken04 })
.nest("HLv", { type: IDToken })
.nest("PIdTag", { type: IDToken })
.nest("HId2", { type: IDToken })
.nest("HLv2", { type: IDToken })
.nest("PNameTag", { type: strToken04 })
.nest("PNameValue", { type: strToken04 })
.nest("HId", { type: IDToken })
.uint8("eot")

function makeUntilCntEnd() {
    let prev = 0
    return function (v: number) {
        if (prev == 0x05 && v == 0x04) { return true }
        if (prev == 0xFF && v == 0xFF) { return true }
        prev = v
        return false
    }
}
const CntParser = new Parser()
.nest("Cnt", { type: strToken04 })
.buffer("CntBuffer", { readUntil: makeUntilCntEnd() })
.uint8("eot")

const SelfCharParser = new Parser()
.uint16("eot0504")
const HClt2Parser = new Parser()
const HAw2Parser = new Parser()

const tagParsers = {
    "SelfChar": SelfCharParser,
    "HClt2": HClt2Parser,
    "HAw2": HAw2Parser
}
const idToParser = Object.fromEntries(Object.entries(tagParsers).map(([k, v], index) => [index, v]))
const tagToIdMap = Object.fromEntries(Object.entries(tagParsers).map(([k, v], index) => [k, index]))

const tagToId = (tag: any) => tagToIdMap[tag.value]

const TokenParser = new Parser()
.nest("tag", { type: strToken, formatter: tagToId })
.choice("data", { tag: "tag", choices: idToParser })

const battleReportParser = new Parser()
.nest("body", { type: strToken0504 })
.nest("content", { type: strToken0504 })
.nest("isSOC", { type: isSOCTag })
.nest("STs", { type: strToken0504 })
.array("Participants", { type: participantParser, readUntil: (v) => { return v.eot == 0xFF } })
.uint8("ParticipantsSep")
.nest("Schema", { type: IDToken })
.nest("Btk", { type: IDToken })
.nest("GsId", { type: IDToken })
.nest("Samples", { type: strToken0504 })
.buffer("SamplesValue", { length: 10 })
.array("Cnts", { type: CntParser, readUntil: (v) => { return v.eot == 0xFF } })
.uint8("CntsSep")
.array("Tokens", { type: TokenParser, length: 2})
// .nest("SelfChar", { type: strToken0504 })
// .nest("Token", { type: strToken0504 })

try {
    const files = await fs.readdir(dir)
    let i = 0
    for (const fname of files) {
        if (!fname.startsWith("Persistent.Mail.")) continue
        const fpath = path.join(dir, fname)
        const fdata = await fs.readFile(fpath, null)

        const result = classificator.parse(fdata)
        if (!(result.typeOrSender.key.name == "type") || result.typeOrSender.value.name != "Battle") {
            // fs.unlink(fpath)
            continue
        }
        console.log(fname)
        const battleData = fdata.subarray(result.offset)
        const battleResult = battleReportParser.parse(battleData)
        console.log(battleResult.Tokens)
    }
} catch (err) {
    console.error(err)
}