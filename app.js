require("dotenv").config()                           //impor dan mengkonfigurasi variabel environment yang ada dalam file .env.
const express = require ('express');                 //import express.
const userRoute = require('./router/userRoutes');    //impor router.

//middleware use
const app = express();
app.use(express.json());
app.use('/api', userRoute);    //app.use("/api/users", userRouter);.

//router
app.get("/home", (req ,res)=>{
  res.send("Selamat Datang di Halaman Utama Click")
});

//PORT
const port = process.env.PORT || 8000
app.listen(port,()=>{
  console.log(`Server berjalan pada PORT : ${port}`);
});