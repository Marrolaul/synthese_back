import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import MainRouter from './routes/MainRouter.js';
import errorHandler from './middleware/errorHandler.js';
import databaseInit from './utils/databaseInit.js';
import i18n from './config/i18n.js';
import cors from './config/cors.js';

const app = express()
const port = 3000
app.use(express.json())
app.use(i18n.init)
app.use(cors)

const uri = process.env.CONNECTION_STRING!
mongoose.connect(uri)
   .then(() => console.log("✔️  Mongo database connected"))
   .catch((err) => console.log("❌  Mongo database error: ", err)
)

databaseInit.ensureDatabase();

app.use("/", MainRouter)
app.use(errorHandler)

app.listen(port, () => console.log(`✔️  Server running on http://localhost:${port}`))