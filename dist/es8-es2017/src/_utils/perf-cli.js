"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const zip1_1 = require("./zip/zip1");
const zip2_1 = require("./zip/zip2");
const zip3_1 = require("./zip/zip3");
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname:");
console.log(__dirname);
const args = process.argv.slice(2);
console.log("args:");
console.log(args);
let filePath = args[0];
if (!filePath) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
filePath = filePath.trim();
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, filePath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), filePath);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            console.log("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
const fileName = path.basename(filePath);
const ext = path.extname(fileName).toLowerCase();
if (/\.epub[3?]$/.test(ext) || ext === ".cbz" || ext === ".zip") {
    (async () => {
        const time3 = process.hrtime();
        const zip3 = await zip3_1.Zip3.loadPromise(filePath);
        const diff3 = process.hrtime(time3);
        console.log(`Zip 3 (${zip3.entriesCount()}): ${diff3[0]} seconds + ${diff3[1]} nanoseconds`);
        const time2 = process.hrtime();
        const zip2 = await zip2_1.Zip2.loadPromise(filePath);
        const diff2 = process.hrtime(time2);
        console.log(`Zip 2 (${zip2.entriesCount()}): ${diff2[0]} seconds + ${diff2[1]} nanoseconds`);
        const time1 = process.hrtime();
        const zip1 = await zip1_1.Zip1.loadPromise(filePath);
        const diff1 = process.hrtime(time1);
        console.log(`Zip 1 (${zip1.entriesCount()}): ${diff1[0]} seconds + ${diff1[1]} nanoseconds`);
    })();
}
//# sourceMappingURL=perf-cli.js.map