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
        url: 'https://cerditalapi.cloud',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Aquí van los archivos donde documentas con Swagger
};

export const swaggerSpec = swaggerJSDoc(options);
