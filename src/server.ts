import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { checkConnection } from './config/db';
import { checkConnection as checkRedis } from './config/redis';
import "./jobs/agendaCronJob"
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

checkRedis().then(() => {
    console.log("Redis Conectado");
});


import authRoutes from './routes/auth.routes';
import batchRoutes from './routes/batch.routes';
import feedingRoutes from './routes/feeding.routes';
import healthRoutes from './routes/health.routes';
import financeRoutes from './routes/finance.routes'
import progressRoutes from './routes/progress.routes'
import listRoutes from './routes/list.routes'
import homeRoutes from './routes/home.routes'
import pushRoutes from './routes/push.routes';
import agendaRoutes from './routes/agenda.routes';

dotenv.config();

const app = express();
const PORT = 5000;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }));

app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/finance', financeRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/list', listRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/agenda', agendaRoutes)
app.use('/api/push', pushRoutes);



checkConnection().then(() => {
app.listen(PORT, () => { 
    console.log(`Servidor Corriendo ${PORT}`);
    });
});
