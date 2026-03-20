import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const INPUT_IMAGE = 'design-preview/Gemini_Generated_Image_ph2kpuph2kpuph2k.png';
const OUTPUT_DIR = 'frontend/public/assets';

async function extract() {
  console.log('Loading image:', INPUT_IMAGE);
  const image = await Jimp.read(INPUT_IMAGE);
  const { width, height } = image.bitmap;
  console.log(`Dimensions: ${width}x${height}`);

  // Ensure output directories exist
  if (!fs.existsSync(path.join(OUTPUT_DIR, 'mascot'))) {
    fs.mkdirSync(path.join(OUTPUT_DIR, 'mascot'), { recursive: true });
  }
  if (!fs.existsSync(path.join(OUTPUT_DIR, 'icons'))) {
    fs.mkdirSync(path.join(OUTPUT_DIR, 'icons'), { recursive: true });
  }

  // Function to make white transparent
  function makeTransparent(img) {
    // Jimp doesn't have a direct "replace color with alpha" easily for complex images
    // but we can iterate or use a simple threshold.
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      // If color is near white, make it transparent
      if (r > 245 && g > 245 && b > 245) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    return img;
  }

  // 1. Extract 5 Mascots
  const mascotHeight = Math.floor(height * 0.45);
  const mascotWidth = Math.floor(width / 5);
  const mascotNames = ['basic', 'savings', 'warning', 'analysis', 'payment'];

  for (let i = 0; i < 5; i++) {
    const x = i * mascotWidth;
    const y = 50; 
    console.log(`Cropping mascot: ${mascotNames[i]} at ${x},${y}`);
    const mascot = image.clone().crop({ x, y, w: mascotWidth, h: mascotHeight - 50 });
    makeTransparent(mascot);
    mascot.autocrop();
    await mascot.write(path.join(OUTPUT_DIR, 'mascot', `kkulsori_${mascotNames[i]}.png`));
  }

  // 2. Extract Icons
  const iconStartY = Math.floor(height * 0.45);
  const iconGridRows = 2;
  const iconGridCols = 9;
  const iconCellWidth = Math.floor(width / iconGridCols);
  const iconCellHeight = Math.floor((height - iconStartY) / iconGridRows);

  const iconNames = [
    'home', 'ledger', 'card', 'settings', 'food', 'transport', 'shopping', 'culture', 'extra',
    'category', 'budget', 'config', 'spacer', 'savings', 'invest', 'bills', 'misc', 'unknown'
  ];

  let iconIdx = 0;
  for (let r = 0; r < iconGridRows; r++) {
    for (let c = 0; c < iconGridCols; c++) {
      if (iconIdx >= iconNames.length) break;
      const x = c * iconCellWidth;
      const y = iconStartY + (r * iconCellHeight);
      console.log(`Cropping icon: ${iconNames[iconIdx]} at ${x},${y}`);
      const icon = image.clone().crop({ x, y, w: iconCellWidth, h: iconCellHeight });
      makeTransparent(icon);
      icon.autocrop();
      await icon.write(path.join(OUTPUT_DIR, 'icons', `icon_${iconNames[iconIdx]}.png`));
      iconIdx++;
    }
  }

  console.log('Extraction complete (with transparency)!');
}

extract().catch(console.error);
