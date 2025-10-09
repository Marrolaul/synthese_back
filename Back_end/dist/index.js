import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import MainRouter from './routes/MainRouter.js';
import errorHandler from './middleware/errorHandler.js';
import databaseInit from './utils/databaseInit.js';
import i18n from './config/i18n.js';
import cors from './config/cors.js';
import Stripe from 'stripe';
import { fulfillCheckout } from './middleware/stripe.js';
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET);
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    let event;
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        const signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.log('Webhook signature verification failed.', err);
            return res.sendStatus(400);
        }
        if (event.type == 'charge.succeeded') {
            const appointmentIdList = event.data.object.metadata.appIdList.split(',').map((id) => {
                return Number(id);
            });
            const totalPrice = Number(Number(event.data.object.amount / 100).toFixed(2));
            fulfillCheckout(totalPrice, appointmentIdList);
        }
    }
    return res.sendStatus(200);
});
const port = 3000;
app.use(express.json());
app.use(i18n.init);
app.use(cors);
const uri = process.env.CONNECTION_STRING;
await mongoose.connect(uri)
    .then(() => console.log("✔️  Mongo database connected"))
    .catch((err) => console.log("❌  Mongo database error: ", err));
databaseInit.ensureDatabase();
app.use("/", MainRouter);
app.use(errorHandler);
app.listen(port, () => console.log(`✔️  Server running on http://localhost:${port}`));
