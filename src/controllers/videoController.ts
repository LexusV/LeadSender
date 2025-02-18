import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import videoService from '../services/videoService';

/**
 * @swagger
 * tags:
 *   name: Video
 *   description: API для работы с видео
 */
class VideoController {
  
  /**
   * @swagger
   * /upload:
   *   post:
   *     summary: Загрузка и конвертация видео
   *     tags: [Video]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               video:
   *                 type: string
   *                 format: binary
   *                 description: Видеофайл в формате .mov
   *     responses:
   *       200:
   *         description: Успешная конвертация
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 downloadLink:
   *                   type: string
   *                   description: Ссылка для скачивания конвертированного видео
   *       400:
   *         description: Неверный формат файла
   *       500:
   *         description: Ошибка конвертации
   */
  async uploadVideo(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).send('Файл отсутствует');
      return;
    }

    if (path.extname(req.file.originalname).toLowerCase() !== '.mov') {
      res.status(400).send('Файл должен быть в формате .mov');
      fs.unlinkSync(req.file.path);
      return;
    }

    try {
      const convertedFilePath = await videoService.convertVideo(req.file.path);
      const protocol = req.protocol;
      const host = req.get('host');
      const downloadLink = `${protocol}://${host}/download/${path.basename(convertedFilePath)}`;
      
      res.json({ downloadLink });
    } catch (err) {
      res.status(500).send(`Ошибка конвертации: ${(err as Error).message}`);
    }
  }


  /**
   * @swagger
   * /download/{filename}:
   *   get:
   *     summary: Скачивание конвертированного видео
   *     tags: [Video]
   *     parameters:
   *       - in: path
   *         name: filename
   *         required: true
   *         schema:
   *           type: string
   *         description: Имя файла для скачивания
   *     responses:
   *       200:
   *         description: Успешное скачивание файла
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Файл не найден
   *       500:
   *         description: Ошибка при скачивании файла
   */
  downloadVideo(req: Request, res: Response): void {
    const filePath = path.join(__dirname, '../../src/converted', req.params.filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).send('Файл не найден');
      return;
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Ошибка при скачивании файла:', err.message);
        res.status(500).send('Ошибка при скачивании файла');
      } else {
        // Удаление файла после успешного скачивания (опционально)
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Ошибка при удалении файла ${filePath}:`, unlinkErr);
          } else {
            console.log(`Файл ${filePath} успешно удален.`);
          }
        });
      }
    });
  }
}

export default new VideoController();
