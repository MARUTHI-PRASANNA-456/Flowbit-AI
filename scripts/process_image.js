import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function processImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const inputPath = path.join(__dirname, "input_user.jpg");
  const outputPath = path.join(__dirname, "../public/nav-user.png");

  // Read image as base64 to inject
  const imageBuffer = fs.readFileSync(inputPath);
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
    "base64"
  )}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="canvas"></canvas>
      <script>
        function process(base64) {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.getElementById('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Simple threshold for white background
                if (r > 240 && g > 240 && b > 240) {
                  data[i + 3] = 0; // Set alpha to 0
                }
              }
              
              ctx.putImageData(imageData, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            };
            img.src = base64;
          });
        }
      </script>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);

  // Run processing in browser
  const resultBase64 = await page.evaluate((base64) => {
    return window.process(base64);
  }, base64Image);

  // Save result
  const base64Data = resultBase64.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(outputPath, base64Data, "base64");

  console.log(`Saved processed image to ${outputPath}`);
  await browser.close();
}

processImage().catch(console.error);
