import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath);

class VideoService {
  convertVideo(inputFilePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFilePath = path.join('src/converted', `${Date.now()}.mp4`);

      ffmpeg(inputFilePath)
        .output(outputFilePath)
        .on('end', () => {
          // Проверяем, существует ли файл перед удалением
          fs.access(inputFilePath, fs.constants.F_OK, (err) => {
            if (err) {
              console.warn(`Файл ${inputFilePath} не существует или недоступен для удаления.`);
              resolve(outputFilePath);
              return;
            }

            // Удаляем входной файл после успешной конвертации
            fs.unlink(inputFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Ошибка при удалении входного файла ${inputFilePath}:`, unlinkErr);
              } else {
                console.log(`Входной файл ${inputFilePath} успешно удален.`);
              }
              resolve(outputFilePath);
            });
          });
        })
        .on('error', (err: Error) => {
          reject(new Error(`Ошибка при конвертации: ${err.message}`));
        })
        .run();
    });
  }
}

export default new VideoService();
