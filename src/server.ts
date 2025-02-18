import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import videoController from './controllers/videoController';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerOptions';

const app = express();
const PORT = process.env.PORT || 3000;

const specs = swaggerJsdoc(swaggerOptions);

// Настройка хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'src/uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API для загрузки видео
app.post('/upload', upload.single('video'), videoController.uploadVideo);

// API для скачивания видео
app.get('/download/:filename', videoController.downloadVideo);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
