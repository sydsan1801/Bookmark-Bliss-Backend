const express=require("express")
const router=express.Router()
const User=require('../models/user.js')
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const otpGenerator=require('otp-generator');
const nodemailer=require('nodemailer')
const {authenticationToken}=require('./UserAuth.js')
function validatePassword(password){
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); 

    // console.log("Password:", password);
    // console.log("Has uppercase:", hasUppercase);
    // console.log("Has special character:", hasSpecialChar);

    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters long" };
    }

    if (!hasUppercase) {
        return { valid: false, message: "Password must contain at least one uppercase letter" };
    }

    if (!hasSpecialChar) {
        return { valid: false, message: "Password must contain at least one special character" };
    }

    return { valid: true };
}

// sign-Up
router.post("/sign-up",async(req,res)=>{
    try{
        const {username,email,password,passwordConfirm,address}=req.body;

        //check username length should be greater than 3
        if (username.length<4){
            return res.status(400).json({message:"Username length should be greater that 3"})
        }

        // check username exists
        const existingUsername=await User.findOne({username:username});
        if (existingUsername){
            return res.status(400).json({message:"Username already exists"})
        }

        // check email exists
        const existingEmail=await User.findOne({email:email});
        if (existingEmail){
            return res.status(400).json({message:"Email already exists"})
        }


        // validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const salt=await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(password,salt)
        
        const newUser=await new User({username:username,email:email,password:hashPassword,address:address})
        await newUser.save()

        return res.status(200).json({message:"SignUp Successful"})

    } catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
})

// sign-up --->verify-otp
// router.post("/sign-up", async (req, res) => {
//     try {
//         const { username, email, password, passwordConfirm, address } = req.body;

//         // Check username length should be greater than 3
//         if (username.length < 4) {
//             return res.status(400).json({ message: "Username length should be greater than 3" });
//         }

//         // Check if username exists
//         const existingUsername = await User.findOne({ username: username });
//         if (existingUsername) {
//             return res.status(400).json({ message: "Username already exists" });
//         }

//         // Check if email exists
//         const existingEmail = await User.findOne({ email: email });
//         if (existingEmail) {
//             return res.status(400).json({ message: "Email already exists" });
//         }

//         // Validate password
//         const passwordValidation = validatePassword(password);
//         if (!passwordValidation.valid) {
//             return res.status(400).json({ message: passwordValidation.message });
//         }

//         // Check if passwords match
//         if (password !== passwordConfirm) {
//             return res.status(400).json({ message: "Passwords do not match" });
//         }

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashPassword = await bcrypt.hash(password, salt);

//         // Generate OTP (6-digit code)
//         const otp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP

//         // Create new user
//         const newUser = new User({
//             username: username,
//             email: email,
//             password: hashPassword,
//             address: address,
//             otp: otp,
//             otpExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
//         });

//         // Save the new user to the database
//         await newUser.save();

//         // Configure Nodemailer transport
//         const transporter = nodemailer.createTransport({
//             service: "Gmail",
//             auth: {
//                 user: process.env.MAIL_ID, // Add your Gmail address to .env
//                 pass: process.env.MAIL_PASS, // Add your Gmail password to .env
//             },
//             logger: true,  // Enable logging
//             debug: true,   // Enable debugging
//         });

//         // Create mail options
//         const mailOptions = {
//             from: process.env.MAIL_ID, // Sender address
//             to: email, // Recipient email
//             subject: "OTP for Email Verification", // Email subject
//             text: `Your OTP for Bookmark Bliss  email verification is: ${otp}. It will expire in 10 minutes.`, // Email body
//         };

//         // Send OTP email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log(error);
//                 return res.status(500).json({ message: "Error sending email" });
//             }
//             res.status(200).json({ message: "OTP sent to email" });
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

// verify-otp
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, combinedOtp } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required." });
//     }
//     if (!combinedOtp) {
//       return res.status(400).json({ message: "OTP is required." });
//     }

//     console.log("Received email:", email);
//     console.log("Received OTP:", combinedOtp); // Log the received OTP

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Ensure OTP is an integer and check if it matches
//     if (user.otp === combinedOtp) {
//       user.isVerified = true;
//       await user.save();  // Save the updated user with isVerified = true
//       return res.status(200).json({
//         success: true,
//         message: "OTP verified successfully.",
//         data: user
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP."
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// sign-In
router.post('/sign-in',async(req,res)=>{
    try{
        const {username,password}=req.body;
        const existingUser=await User.findOne({username});
        if (!existingUser){
            return res.status(400).json({message:"Invalid credentials"})
        }

        await bcrypt.compare(password,existingUser.password,(err,data)=>{
            if (data){
                const authClaims=[{name:existingUser.username},{role:existingUser.role}]
                const token=jwt.sign({authClaims},process.env.JWT_SECRET,{expiresIn:"1d"})
                return res.status(200).json({success:true,message:"SignIn Successful",data:{
                    id:existingUser._id,
                    role:existingUser.role,
                    token:token
                }})
            }
            else{
                res.status(400).json({message:"Invalid credentials"})
            }
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// Get User Information
router.get("/get-user-information",authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        // display user info without password (-)
        const data=await User.findById(id).select("-password")
        return res.status(200).json(data)
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})

// Update address
router.put('/update-address',authenticationToken,async(req,res)=>{
    try{
        const {id}=req.headers;
        const {address}=req.body;
        await User.findByIdAndUpdate(id,{address:address})
        return res.status(200).json({message:"Address Updated Successfully"})
    }
    catch(error){
        return res.status(500).json({message:"Internal Server Error"})
    }
})



module.exports=router