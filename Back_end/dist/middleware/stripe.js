import 'dotenv/config';
import Stripe from 'stripe';
import createError from '../utils/createError.js';
const stripe = new Stripe(process.env.STRIPE_SECRET);
export default async function charge(req, res, next) {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'cad',
                    product_data: {
                        name: "Longueuil"
                    },
                    unit_amount: 50 * 100
                },
                quantity: 1
            }
        ],
        mode: "payment",
        success_url: 'http://localhost:3000/complete',
        cancel_url: 'http://localhost:3000/cancel'
    });
    if (session.url) {
        console.log(session.url);
        res.json({ url: session.url });
    }
    else {
        next(createError(500, "error_payment", "Stripe Error"));
    }
}
