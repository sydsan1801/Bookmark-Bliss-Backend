const mongoose=require("mongoose")
const user=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    
    address:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        default:"https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3485.jpg"
    },

    // otp: {
    //     type: Number, 
    // },
    
    // isVerified: {
    //     type: Boolean,
    //     default: false,
    // },

    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    favourites:[
        {
            type:mongoose.Types.ObjectId,
            ref:"books",
    },
    ],

    cart:[
        {
            type:mongoose.Types.ObjectId,
            ref:"books",

    },
    ],

    orders:[
        {
            type:mongoose.Types.ObjectId,
            ref:"order",

    },
    ]

},{timestamps:true}
)

module.exports=mongoose.model("user",user)