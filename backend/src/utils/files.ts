import path from 'path';
import fs from 'fs/promises';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const publicDir = path.join(__dirname, '..', 'public');

export const moveFile = async (fileName: string) => {
  const baseName = path.basename(fileName);
  const fromPath = path.join(__dirname, '..', UPLOAD_PATH_TEMP as string, baseName);
  const toPath = path.join(publicDir, UPLOAD_PATH as string, baseName);
  await fs.copyFile(fromPath, toPath);
  await fs.unlink(fromPath).catch(() => {});
  return `/images/${baseName}`;
};

export const removeFile = async (fileName?: string) => {
  if (!fileName) {
    return;
  }
  const baseName = path.basename(fileName);
  const file = path.join(publicDir, UPLOAD_PATH as string, baseName);
  await fs.unlink(file).catch(() => {});
};
