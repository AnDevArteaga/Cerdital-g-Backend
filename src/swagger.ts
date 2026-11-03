import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Cerdital G',
      version: '1.0.0',
      description: 'Documentación de la API de Cerdital G',
    },
    servers: [
      {
        url: process.env.PUBLIC_URL || 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};



export const swaggerSpec = swaggerJSDoc(options);
