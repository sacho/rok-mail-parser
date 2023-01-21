import * as fs from "node:fs/promises"
import * as path from "node:path"
import { BattleLogParser} from "./parser.js"


const dir = "data/logs_2"

try {
    const files = await fs.readdir(dir)
    let i = 0
    for (const fname of files) {
        if (!fname.startsWith("Persistent.Mail.")) continue
        const fpath = path.join(dir, fname)
        const fdata = await fs.readFile(fpath, null)

        const parser = new BattleLogParser(fdata)
        const data = parser.parse()

        const type = data.get('data').get('type')
        if (type != "Battle") {
            continue
        }
        console.log(fname)
        const time = data.get('data').get('time')
        console.log(new Date(time / 1000))
        //console.log(data)
        // break
    }
} catch (err) {
    console.error(err)
}