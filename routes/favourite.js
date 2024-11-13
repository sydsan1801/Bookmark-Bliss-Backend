const express=require("express")
const router=express.Router()
const User=require("../models/user.js")
const Book=require('../models/book.js')

const {authenticationToken}=require('./UserAuth.js')

// add book to favourite
router.put("/add-book-to-favourite",authenticationToken,async(req,res)=>{
    try{
        const {bookid,id}=req.headers;
        const UserData=await User.findById(id)
        const isFavourites=UserData.favourites.includes(bookid)
        if (isFavourites){
            return res.status(200).json({message:"Book is already in favourites"})
        }
        await User.findByIdAndUpdate(id,{$push:{favourites:bookid}});
        return res.status(200).json({message:"Book added to favourites"})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// delete a book
router.put("/remove-book-from-favourite",authenticationToken,async(req,res)=>{
    try{
        const {id,bookid}=req.headers;
        const UserData=await User.findById(id)
        const isFavourites=UserData.favourites.includes(bookid)
        if (isFavourites){
            await User.findByIdAndUpdate(id,{$pull:{favourites:bookid}})
        }
        return res.status(200).json({message:"Book removed from favourites"})
        
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get-all-favourite-books
router.get("/get-favourite-books",authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const UserData=await User.findById(id).populate("favourites");
        const favouriteBooks=UserData.favourites;
        return res.status(200).json({
            status:"Success",
            data:favouriteBooks,
        });
        
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})
module.exports=router;