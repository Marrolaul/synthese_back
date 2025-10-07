import cors from 'cors';
const corsOptions = {
    origin: 'https://synthese-front.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'lang'],
    credentials: true,
};
export default cors(corsOptions);
