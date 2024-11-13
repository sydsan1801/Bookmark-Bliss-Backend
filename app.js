const express=require("express")
const app=express()
const cors=require("cors")

app.use(cors(
   { origin:[''] ,  
  methods: ['GET, POST, PUT, DELETE'], 
  credentials: true,  }
));  
app.use(express.json())

require("dotenv").config()
require("./conn/conn.js")
const User=require("./routes/user.js")
const Book=require("./routes/book.js")
const Favourite=require("./routes/favourite.js")
const Cart=require("./routes/cart.js")
const Order=require("./routes/order.js")
app.use(cors())

// routes
app.use("/api/v1",User)
app.use("/api/v1",Book)
app.use("/api/v1",Favourite)
app.use("/api/v1",Cart)
app.use("/api/v1",Order)

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`)
})

