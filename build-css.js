import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import path from 'path';

async function buildCSS() {
  const css = await fs.readFile('./src/index.css', 'utf8');
  
  const result = await postcss([
    tailwindcss,
    autoprefixer
  ]).process(css, { from: './src/index.css' });
  
  await fs.mkdir('./dist', { recursive: true });
  await fs.writeFile('./dist/main.css', result.css);
  
  console.log('CSS built successfully');
}

buildCSS().catch(console.error);