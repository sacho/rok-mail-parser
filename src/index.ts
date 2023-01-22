import * as fs from "node:fs/promises"
import * as path from "node:path"
import { BattleLogParser} from "./parser.js"
import numeral from 'numeral'


const dir = "data/logs_1"

type BattleAttack = {

}

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

        const HIdMap: Map<number, string> = new Map([
            [148, "(P) Joan"],
            [138, "Nevsky"],
            [108, "Guan"],
            [140, "(P) Scipio"],
            [6, "YSG"],
            [110, "Ramses"],
            [127, "XY"],
            [115, "William"]
        ])
        const time = data.get('data').get('time')
        const content = data.get('data').get('body').get('content')
        const player = content.get('SelfChar')
        const pname = player.get('PName')
        const alliance = player.get('Abbr')
        const hid1 = player.get("HId") as number
        const hname1 = HIdMap.get(hid1) ?? hid1
        const hid2 = player.get("HId2")
        const hname2 = HIdMap.get(hid2) ?? hid2
        const attacks = content.get('Attacks') as Map<unknown, any>
        let totalDone = 0
        let totalTaken = 0
        let totalDonePower = 0
        let totalTakenPower = 0
        const pvpAttacks = Array.from(attacks.values()).filter(attack => attack.get("CIdt").get("NpcBType") == undefined && attack.get("Kill").get("BadHurt") != 0)
        if (pvpAttacks.length == 0) {
            continue
        }
        console.log(fname)
        console.log("DateTime: ", new Date(time / 1000))
        console.log(`Player: [${alliance}] ${pname} March: ${hname1} / ${hname2}`)
        for (const attack of pvpAttacks) {
            const taken = attack.get('Damage').get('BadHurt')
            const takenPower = -attack.get('Damage').get('Power')
            const done = attack.get('Kill').get('BadHurt')
            const donePower = -attack.get('Kill').get('Power')
            const ots = Array.from(attack.get('OTs').values())
            if (ots.length > 1) {
                console.log("Curious - OTs > 1")
            }
            const cidt = attack.get('CIdt')
            const cname = cidt.get('PName')
            const cally = cidt.get('Abbr')
            const chid1 = cidt.get("HId") as number
            const chname1 = HIdMap.get(chid1) ?? chid1
            const chid2 = cidt.get("HId2")
            const chname2 = HIdMap.get(chid2) ?? chid2
            console.log(`Vs [${cally}] ${cname} March: ${chname1} / ${chname2} Inflicted(${numeral(done).format("0,0")} / P${numeral(donePower).format("0,0")}) Taken(${numeral(taken).format("0,0")} / P${numeral(takenPower).format("0,0")})`)
            totalDone += done
            totalDonePower += donePower
            totalTaken += taken
            totalTakenPower += takenPower
        }
        console.log(`Combat Stats: Inflicted (${numeral(totalDone).format("0,0")} / P${numeral(totalDonePower).format("0,0")}}  Taken(${numeral(totalTaken).format("0,0")} / P${numeral(totalTakenPower).format("0,0")}) Ratio: (${numeral(totalDone / totalTaken).format("0.00")} / ${numeral(totalDonePower / totalTakenPower).format("0.00")})}`)
        console.log("!");
    }
} catch (err) {
    console.error(err)
}