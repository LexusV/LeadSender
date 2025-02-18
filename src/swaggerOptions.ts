import path from 'path';

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Video Converter API',
        version: '1.0.0',
        description: 'API для конвертации видео из .mov в .mp4',
      },
    },
    apis: [path.join(__dirname, '../src/controllers/*.ts')], 
  };
  

export default swaggerOptions;
