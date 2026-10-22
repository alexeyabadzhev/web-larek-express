import cron from 'node-cron';
import path from 'path';
import fs from 'fs/promises';
import { UPLOAD_PATH_TEMP } from '../config';

const tempDir = path.join(__dirname, '..', UPLOAD_PATH_TEMP as string);

cron.schedule('0 * * * *', async () => {
  const files = await fs.readdir(tempDir).catch(() => [] as string[]);
  const oneHour = Date.now() - 60 * 60 * 1000;
  await Promise.all(
    files.map(async (name) => {
      const file = path.join(tempDir, name);
      const stat = await fs.stat(file).catch(() => null);
      if (stat && stat.mtimeMs < oneHour) {
        await fs.unlink(file).catch(() => {});
      }
    }),
  );
});
