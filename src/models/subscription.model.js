import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new Schema({
 subscriber :{
    type: Schema.Types.ObjectId,// user subscriber
    ref: "User"

 },
 channel :{
    type: Schema.Types.ObjectId,// user subscriber
    ref: "User"

 },
 
},{timestamps: true})

export const Subscription = mongoose.model('Subscription', subscriptionSchema)