import * as fs from "node:fs/promises"
import * as path from "node:path"
import { BattleLogParser} from "./parser.js"


const dir = "data/logs_1"

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
        console.log("DateTime: ", new Date(time / 1000))
        const content = data.get('data').get('body').get('content')
        const player = content.get('SelfChar')
        const pname = player.get('PName')
        const alliance = player.get('Abbr')
        const hid1 = player.get("HId")
        const hid2 = player.get("HId2")
        const attacks = content.get('Attacks')
        console.log(`Player: ${pname}`)
        console.log(`Alliance: ${alliance}`)
        console.log(`March: ${hid1} / ${hid2}`)
        let totalDone = 0
        let totalTaken = 0
        for (const [_, attack] of attacks) {
            const taken = attack.get('Damage').get('BadHurt')
            const done = attack.get('Kill').get('BadHurt')
            totalDone += done
            totalTaken += taken
            if (totalDone > 0) {
                console.log("pvp")
            }
            console.log(`Fight: Inflicted(${done} Taken(${taken})`)
        }
        console.log(`Total Stats(Inflicted/Taken): ${totalDone}/${totalTaken}`)
        console.log("!");
    }
} catch (err) {
    console.error(err)
}