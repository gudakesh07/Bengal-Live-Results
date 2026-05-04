import fs from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

async function downloadPic(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
  const fileStream = (await fs.open(dest, 'w')).createWriteStream();
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

await fs.mkdir('src/assets/images', { recursive: true });
await downloadPic('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait.png/800px-Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait.png', 'src/assets/images/modi.png');
console.log('modi.png downloaded');
await downloadPic('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Mamata_Banerjee_in_May_2021_%28cropped%29.jpg/800px-Mamata_Banerjee_in_May_2021_%28cropped%29.jpg', 'src/assets/images/mamata.jpg');
console.log('mamata.jpg downloaded');
