import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import cors from 'cors';
import router from './routes/index.js';

const PORT = process.env.PORT;
const server = express();

server.use(express.json());
server.use(morgan('dev'));
server.use(cors())

server.use('/api', router);

server.listen(PORT, () => {
    console.log("Email service running on port ", PORT);
})