import 'dotenv/config';
import { Request, Response, NextFunction } from "express";
import Stripe from 'stripe';
import validate from '../utils/validate.js';
import createError from '../utils/createError.js';
import { Appointment } from '../models/Appointment.js';
import { AppointmentType } from '../types/AppointmentsTypes/AppointmentType.js';
import { Transaction } from '../models/Transaction.js';

const stripe = new Stripe(process.env.STRIPE_SECRET!);

export async function charge(req : Request, res : Response, next : NextFunction) {
    if(!validate.isArrayOfNumber(req.body)) {
        next(createError(400, "bad_request", "Bad Request"));
    }
    let appointmentsIdList : number[] = req.body;
    let lineItems : any[] = await Promise.all(
        appointmentsIdList.map(async (element) => {
            try {
                const result: AppointmentType[] = await Appointment.getByFieldId(element);
                const appointmentInfo = result[0];
                return {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: appointmentInfo.haircut.name,
                        },
                        unit_amount: appointmentInfo.haircut.price * 100,
                    },
                    quantity: 1,
                };
            } catch (error) {
                next(error);
            }
        })
    );
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        success_url: 'http://localhost:5173/complete',
        cancel_url: 'http://localhost:5173/cancel',
        payment_intent_data: {metadata: {appIdList : appointmentsIdList.toString()}}
    });
    if(session.url){
        res.status(200).json({url: session.url});
    } else {
        next(createError(500, "error_payment", "Stripe Error"));
    }

}

export async function fulfillCheckout(totalPrice : number,appointmentIdList : number[]) {
    const newTransaction = new Transaction({
        datePaid: new Date(Date.now()).toISOString().split('T')[0],
        totalPrice : totalPrice,
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


