import * as fs from "node:fs/promises";
import * as path from "node:path";
import { BattleLogParser } from "./parser.js";
// import { MailWatcher } from "./watcher.js";
import numeral from "numeral";

// const dir = "C:\\Games\\ROK\\save\\mailcache";
const dir =
    "C:\\Sandbox\\Sacho\\RoK_SheLLz\\drive\\C\\Games\\ROK\\save\\mailcache";

type BattleAttack = {};

// function main() {
//     const mailDirectory = "C:\\Games\\ROK\\save\\mailcache";
//     const dbDirectory = "C:\\Work\\rok2\\mail_parser\\data";
//     const watcher = new MailWatcher(mailDirectory);
//     const catalog = new MailCatalog(dbDirectory);
// }

// if (require.main === module) {
//     main();
// }

// (async () => {
//     try {
//         const watcher = fs.watch(dir);
//         for await (const event of watcher) {
//             console.log(event);
//             const fpath = path.join(dir, event.filename);
//             const fdata = await fs.readFile(fpath, null);

//             const parser = new BattleLogParser(fdata);
//             const data = parser.parse();
//             console.log(data);
//         }
//     } catch (err: any) {
//         if (err.name === "AbortError") {
//             return;
//         }
//         throw err;
//     }
// })();

try {
    const files = await fs.readdir(dir);
    let i = 0;
    const types: { [key: string]: string[] } = {};
    const titles: { [key: string]: string[] } = {};
    let totalDone = 0;
    let totalTaken = 0;
    let totalDonePower = 0;
    let totalTakenPower = 0;
    let marchMap: { [key: string]: any } = {};
    for (const fname of files) {
        if (!fname.startsWith("Persistent.Mail.")) continue;
        const fpath = path.join(dir, fname);
        const fdata = await fs.readFile(fpath, null);

        const parser = new BattleLogParser(fdata);
        const data = parser.parse();

        const type: string = data["data"]["type"];
        const time2 = new Date(data["data"]["time"] / 1000);
        const june = new Date("2023-07-20");
        const july = new Date("2023-08-15");
        if (time2 < june || time2 > july) {
            continue;
        }
        const title = data?.data?.body?.title;
        if (type != "Battle") {
            continue;
        }

        const HIdMap: { [key: number]: string } = {
            148: "(P) Joan",
            146: "(P) Boudica",
            179: "ZL",
            138: "Nevsky",
            108: "Guan",
            140: "(P) Scipio",
            6: "YSG",
            110: "Ramses",
            127: "XY",
            115: "William",
        };
        const time = data["data"]["time"];
        const content = data["data"]["body"]["content"];
        const player = content["SelfChar"];
        const pname: string = player["PName"];
        if (!pname.includes("SheLLz")) {
            continue;
        }
        const alliance = player["Abbr"];
        const hid1 = player["HId"] as number;
        const hname1 = HIdMap[hid1] ?? hid1;
        const hid2 = player["HId2"];
        const hname2 = HIdMap[hid2] ?? hid2;
        const attacks = content["Attacks"] as { [key: string]: any };
        const pvpAttacks: any[] = Array.from(Object.values(attacks)).filter(
            (attack: any) =>
                attack["CIdt"]["NpcBType"] == undefined &&
                attack["Kill"]["BadHurt"] != 0
        );
        if (pvpAttacks.length == 0) {
            continue;
        }
        console.log(fname);
        console.log("DateTime: ", new Date(time / 1000));
        console.log(
            `Player: [${alliance}] ${pname} March: ${hname1} / ${hname2}`
        );
        if (!marchMap[`${hname1}/${hname2}`]) {
            marchMap[`${hname1}/${hname2}`] = {
                done: 0,
                taken: 0,
            };
        }
        for (const attack of pvpAttacks) {
            const taken = attack["Damage"]["BadHurt"];
            const takenPower = -attack["Damage"]["Power"];
            const done = attack["Kill"]["BadHurt"];
            const donePower = -attack["Kill"]["Power"];
            const ots = Array.from(attack["OTs"]);
            if (ots.length > 1) {
                console.log("Curious - OTs > 1");
            }
            const cidt = attack["CIdt"];
            const cname = cidt["PName"];
            const cally = cidt["Abbr"];
            const chid1 = cidt["HId"] as number;
            const chname1 = HIdMap[chid1] ?? chid1;
            const chid2 = cidt["HId2"];
            const chname2 = HIdMap[chid2] ?? chid2;
            console.log(
                `Vs [${cally}] ${cname} March: ${chname1} / ${chname2} Inflicted(${numeral(
                    done
                ).format("0,0")} / P${numeral(donePower).format(
                    "0,0"
                )}) Taken(${numeral(taken).format("0,0")} / P${numeral(
                    takenPower
                ).format("0,0")})`
            );
            marchMap[`${hname1}/${hname2}`].done += donePower;
            marchMap[`${hname1}/${hname2}`].taken += takenPower;
            totalDone += done;
            totalDonePower += donePower;
            totalTaken += taken;
            totalTakenPower += takenPower;
        }
        console.log("!");
    }
    console.log(
        `Combat Stats: Inflicted (${numeral(totalDone).format(
            "0,0"
        )} / P${numeral(totalDonePower).format("0,0")}}  Taken(${numeral(
            totalTaken
        ).format("0,0")} / P${numeral(totalTakenPower).format(
            "0,0"
        )}) Ratio: (${numeral(totalDone / totalTaken).format(
            "0.00"
        )} / ${numeral(totalDonePower / totalTakenPower).format("0.00")})}`
    );
    Object.entries(marchMap).forEach(([march, mdata]) => {
        const { done, taken } = mdata;
        const ndone = numeral(done).format("0,0");
        const ntaken = numeral(taken).format("0,0");
        const nratio = numeral(done / taken).format("0.00");
        console.log(
            `March: ${march} Inflicted(${ndone}) Taken(${ntaken}) Ratio: (${nratio})`
        );
    });
} catch (err) {
    console.error(err);
}
