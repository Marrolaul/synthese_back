import express from 'express';
import { charge } from '../middleware/stripe.js';
import jwtAuth from "../middleware/auth.js";

const PaymentRouter = express.Router();

PaymentRouter.post('/stripe/:userId', jwtAuth.requireAuth, jwtAuth.validateSelf, charge);

export default PaymentRouter;