const express=require("express")
const {authenticationToken}=require('./UserAuth.js')
const router=express.Router()
const User=require("../models/user.js")
const Book=require("../models/book.js")
const Order=require('../models/order.js')

// place order user
router.post("/place-order",authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const {order}=req.body;

        for (const orderData of order){
            const newOrder=new Order({user:id,book:orderData._id});
            const orderDataFromDb=await newOrder.save();

            // saving order in user model
            await User.findByIdAndUpdate(id,{$push:{orders:orderDataFromDb._id}})

            // clearing cart
            await User.findByIdAndUpdate(id,{$pull:{cart:orderData._id}})
        }
        return res.status(200).json({status:"Success",message:"Order placed successfully"})
    }
    catch(error){
        console.error("Error placing order:", error);
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get order history-- user
router.get("/get-order-history",authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const UserData=await User.findById(id).populate({
            path:"orders",
            populate:{path:"book"}
        });
        const orderData=UserData.orders.reverse();
        return res.status(200).json({status:"Success",data:orderData})
        
    }catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get all orders-- admin
router.get("/get-all-orders",authenticationToken,async(req,res)=>{
    try{
        const UserData=await Order.find().populate({path:"book"}).populate({path:"user"}).sort({createdAt:-1})
        return res.status(200).json({status:"Success",data:UserData})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// update order --admin
router.put("/update-status/:id",authenticationToken,async(req,res)=>{
   try{
     const {id}=req.params;
        await Order.findByIdAndUpdate(id,{status:req.body.status})
        return res.status(200).json({status:"Success",message:"Status updated successfully"})
   }
   catch(error){
        return res.status(500).json({message:"Internal Server Error"})
   }
})
module.exports=router