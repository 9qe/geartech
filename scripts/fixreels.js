const fs = require("fs");
const p = "src/components/ReelsFeed.tsx";
const lines = fs.readFileSync(p, "utf8").split("\n");
const head = lines.slice(0, 183).join("\n");
const tail = "\n      <p className=\"mt-3 text-center text-xs text-white/40 sm:hidden\">Swipe for more reels</p>\n    </div>\n  );\n}\n";
fs.writeFileSync(p, head + tail);
console.log("done");
