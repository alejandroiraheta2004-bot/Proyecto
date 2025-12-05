const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const pages = ["login.html","dashboard.html","send.html","recharge.html","register.html"];
  const sizes = [
    {name: "desktop", width: 1920, height: 1080},
    {name: "mobile", width: 375, height: 812}
  ];

  const outDir = path.resolve(__dirname, "output_images");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  for (const pageFile of pages) {
    const pagePath = path.resolve(__dirname, "pages", pageFile);
    if (!fs.existsSync(pagePath)) {
      console.error(`ERROR: no se encontró ${pageFile} en /pages. Path esperado: ${pagePath}`);
      continue;
    }

    for (const size of sizes) {
      const page = await browser.newPage();
      await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
      const url = "file://" + pagePath;
      console.log(`Abriendo ${url} a ${size.name} (${size.width}x${size.height})`);
      await page.goto(url, { waitUntil: "networkidle0" });

      await page.waitForTimeout(400);

      const nameBase = path.basename(pageFile, ".html");
      const outFile = path.join(outDir, `${nameBase}_${size.name}.png`);
      await page.screenshot({ path: outFile, fullPage: false });
      console.log(`Guardado: ${outFile}`);
      await page.close();
    }
  }

  await browser.close();
  console.log("Finalizado: capturas guardadas en", outDir);
})();
