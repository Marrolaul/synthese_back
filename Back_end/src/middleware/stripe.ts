import 'dotenv/config';
import { Request, Response, NextFunction } from "express";
import Stripe from 'stripe';
import validate from '../utils/validate.js';
import createError from '../utils/createError.js';
import { Appointment } from '../models/Appointment.js';
import { AppointmentType } from '../types/AppointmentsTypes/AppointmentType.js';
import { Transaction } from '../models/Transaction.js';

const stripe = new Stripe(process.env.STRIPE_SECRET!);

export default async function charge(req : Request, res : Response, next : NextFunction) {
    if(!validate.isArrayOfNumber(req.body)) {
        next(createError(400, "bad_request", "Bad Request"));
    }
    let appointmentsIdList : number[] = req.body;
    let lineItems : any[] = await Promise.all(appointmentsIdList.map((element) => {
        Appointment.getByFieldId(element).then((result: AppointmentType[]) => {
            let appointmentInfo = result[0];
            return {
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name : appointmentInfo.haircut.name
                    },
                    unit_amount: appointmentInfo.haircut.price * 100
                },
                quantity: 1
            }
        }).catch((error) => {
            next(error);
        });
    }));
    console.log(lineItems);
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: 'http://localhost:3000/complete',
        cancel_url: 'http://localhost:3000/cancel'
    });
    if(session.url){
        res.status(308).json({url: session.url});
        try {
            fulfillCheckout(session.id, appointmentsIdList);
        } catch (error) {
            console.log(error);
        }
    } else {
        next(createError(500, "error_payment", "Stripe Error"));
    }

}

async function fulfillCheckout(sessionId : string, appointmentIdList : number[]) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if(checkoutSession.payment_status !== 'unpaid') {
        const newTransaction = new Transaction({
            datePaid: new Date(Date.now()).toISOString().split('T')[0],
            totalPrice : checkoutSession.amount_total,
            paymentMethod : "Stripe"
        });
        try {
            let savedTransaction = await Transaction.create(newTransaction);
            appointmentIdList.forEach(async(appointmentId) => {
                await savedTransaction.confirm(appointmentId);
            });
        } catch {
            throw createError(500, "error_save_payment", "Internal Error");
        }
    }
}

