// Build: minify CSS + JS (with browser-target prefixing/transpiling), trim HTML, copy images.
// Usage: npm install && npm run build
const esbuild = require("esbuild"), fs = require("fs");
const target = ["chrome90", "firefox90", "safari14", "ios14"];
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist/img", { recursive: true });
const css = esbuild.transformSync(fs.readFileSync("src/styles.css", "utf8"), { loader: "css", minify: true, target }).code;
const js = esbuild.transformSync(fs.readFileSync("src/app.js", "utf8"), { minify: true, target }).code;
fs.writeFileSync("dist/app.min.js", js);
const html = fs.readFileSync("src/index.html", "utf8")
  .replace('src="app.js"', 'src="app.min.js"')
  .replace(/<!--[\s\S]*?-->/g, "").replace(/\n\s+/g, "\n")
  .replace('<link rel="stylesheet" href="styles.css">', () => "<style>" + css + "</style>");   // inline CSS: one request fewer
fs.writeFileSync("dist/index.html", html);
for (const f of fs.readdirSync("src/img")) fs.writeFileSync("dist/img/" + f, fs.readFileSync("src/img/" + f, "utf8").replace(/>\s+</g, "><"));
console.log("Built dist/");
