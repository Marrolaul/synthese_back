import express from 'express';
import charge from '../middleware/stripe.js';
const PaymentRouter = express.Router();
PaymentRouter.post('/stripe/testroute', charge);
export default PaymentRouter;
