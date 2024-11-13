const express=require("express")
const router=express.Router()
const {authenticationToken}=require('./UserAuth.js')
const User=require("../models/user.js")
const Book=require('../models/book.js')

// add to cart
router.put("/add-to-cart",authenticationToken,async(req,res)=>{
    try{
        const {id,bookid}=req.headers;
        const UserData=await User.findById(id)
        const isBookInCart=UserData.cart.includes(bookid)
        if (isBookInCart){
            return res.json({
                status:"Success",
                message:"Book is already in cart",
            })
        }

        await User.findByIdAndUpdate(id,{$push:{cart:bookid}})
        return res.status(200).json({status:"Success",message:"Book added to cart"})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// remove from cart
router.put("/remove-from-cart/:bookid",authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const {bookid}=req.params;
        await User.findByIdAndUpdate(id,{$pull:{cart:bookid}});
        return res.json({
            status:"Success",
            message:"Book removed from cart",
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get user cart
router.get("/get-user-cart",authenticationToken,async(req,res)=>{
    try{
        const {id,bookid}=req.headers;
        const UserData=await User.findById(id).populate("cart")
        const cart=UserData.cart.reverse()

        return res.status(200).json({status:"Success",data:cart})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})
module.exports=router