const Stripe = require("stripe")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const pool = require("../config/db")

exports.createPayment = async (req,res)=>{

    const {ride_id,amount} = req.body

    try{

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "inr",
            automatic_payment_methods:{enabled:true}
        })

        await pool.query(
            "INSERT INTO payments (ride_id,amount,payment_status) VALUES ($1,$2,$3)",
            [ride_id,amount,"pending"]
        )

        res.json({
            clientSecret: paymentIntent.client_secret
        })

    }catch(err){

        res.status(500).json(err.message)

    }

}