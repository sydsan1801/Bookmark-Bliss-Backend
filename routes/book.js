const express=require('express')
const router=express.Router()
const jwt=require("jsonwebtoken")
const User=require('../models/user.js')
const Book=require('../models/book.js')
const { authenticationToken } = require('./UserAuth.js')

// add book-admin
router.post("/add-book",authenticationToken,async(req,res)=>{
    try{
        // id->to check if it is admin
        const {id}=req.headers;
        const user=await User.findById(id);
        if(user.role!=="admin"){
            return res.status(400).json({message:"you are not authorized to perform this action "})
        }
        const book=new Book({
            url:req.body.url,
            title:req.body.title,
            author:req.body.author,
            price:req.body.price,
            desc:req.body.desc,
            language:req.body.language,
        });
        await book.save()
        return res.status(200).json({message:"Book Added Successfully"});

    }catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
    
})


// update book-admin
router.put("/update-book",authenticationToken,async(req,res)=>{
    try{
        const {bookid}=req.headers;
        await Book.findByIdAndUpdate(bookid,{
            url:req.body.url,
            title:req.body.title,
            author:req.body.author,
            price:req.body.price,
            desc:req.body.desc,
            language:req.body.language,
        })

        return res.status(200).json({message:"Book Updated Successfully"});

    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})
    }
})

//delete a book--admin
router.delete("/delete-book",authenticationToken,async(req,res)=>{
    try{
        const {bookid}=req.headers;
        await Book.findByIdAndDelete(bookid)
        return res.status(200).json({message:"Book Deleted Successfully"})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get all books
router.get('/get-all-books',async(req,res)=>{
    try{
        const books=await Book.find().sort({createdAt:-1})
        return res.status(200).json({
            status:"Success",
            data:books,
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// get recent books
router.get('/get-recent-books',async(req,res)=>{
    try{
        const recent_books=await Book.find().sort({createdAt:-1}).limit(4)
        return res.status(200).json({
            status:200,
            data:recent_books,
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})

    }
})

// get book by id
router.get('/get-book-by-id/:id',async(req,res)=>{
    try{
        const {id}=req.params;
        const book=await Book.findById(id)
        return res.status(200).json({
            status:"Success",
            data:book
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})
module.exports=router