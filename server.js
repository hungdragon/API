const express = require("express");
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./Model/user");
const FindAwayTeam = require("./Model/findAwayTeam");
const dataPitch = require("./Model/dataPitch");
const CustomerDetail = require("./Model/bookFootball");
const FootballPitch = require("./Model/footballPitch");
const footballPitchDetail = require("./Model/footballPitchDetail");
const auth = require("./MiddleWare/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cors = require("cors");
require("dotenv").config();
const date = require("date-and-time");
const JWT_SECRET =
  "sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk";
var _ = require("lodash");
var moment = require("moment");
var dates = require("date-fns");
moment.locale("vi");
const { boolean } = require("webidl-conversions");
mongoose.connect("mongodb+srv://hungvv:Hanoi1999@cluster0.2wq4vod.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useCreateIndex: true
});
const storage= multer.diskStorage({
  destination: "Images",
  filename: (req, file, cb)=>{
    console.log('image---', Date.now() + path.extname(file.originalname));
    cb(null,Date.now() + path.extname(file.originalname));
  }
});
const upload= multer({storage: storage}).single('image');
const uploadMultiple= multer({storage: storage}).array('imgArray', 5);
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
const keyrefshe= 'dasdasdasdasd'
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("user---" + username);
  const user = await User.findOne({ username }).lean();

  if (!user) {
    //return res.json({ status: 404, error: "Không tồn tại tài khoản !" });
    return res.status(401).send({error: 'Không tồn tại tài khoản !'})
    //return res.status(404).json({error:'khong ton tai tk'})
  }
 
  if (await bcrypt.compare(password, user.password)) {
    // the username, password combination is successful
    const isAdmin = user.isAdmin;
    const _token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET
    );
    const _refeshtoken = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      //config._refeshtoken
      keyrefshe
    );
    //const HOUR = new Date() + (60 * 60 * 1000)
  
    return res.json({
      access_token: _token,
      expires_in: 3600 * 1000,
      refresh_expires_in: 3600 * 1000,
      refresh_token: _refeshtoken,
      //isAdmin: isAdmin,
      token_type:"Bearer",
      //username: user.username,
    });
    //return res.status(200).send(({token:_token}))
  }

  return res.status(401).send(({error:"Tài khoản hoặc mật khẩu không chính xác !"}))
  //return res.send({error:404,message:"loi dang nhao roi"})
  // return res.json({
  //   status: 401,
  //   error: "Tài khoản hoặc mật khẩu không chính xác !",
  // });
});

app.post("/api/register", async (req, res) => {
  const { email, username, password: plainTextPassword } = req.body;
  const user = await User.findOne({ email }).lean();
  //console.log('Email'+JSON.stringify(user.email));
  console.log(req.body);
  if (user) {
    return res.json({ status: "error", error: "Email da ton tai" });
  }

  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }
  if (!email || typeof email !== "string") {
    return res.json({ status: "error", error: "Invalid email" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 7) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 8 characters",
    });
  }
  // const createAt= new Date().toISOString()
  // .replace(/T/, ' ')
  // .replace(/\..+/, '')
  const now = new Date();
  let createAt = date.format(now, "YYYY/MM/DD HH:mm:ss");
  //var createAt=dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
  const fullName = "Your Name";
  const isAdmin = "0";
  const phoneNumber = null;
  const password = await bcrypt.hash(plainTextPassword, 10);
  const _token = jwt.sign(
    {
      username: username,
    },
    JWT_SECRET
  );
  try {
    const response = await User.create({
      username,
      password,
      fullName,
      email,
      phoneNumber,
      createAt,
      isAdmin,
    });
    console.log("User created successfully: ", response);
    const user = await response.save();
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }
  res.json({
    status: "ok",
    token: _token,
    isAdmin: isAdmin,
    username: username,
  });
});
app.get("/users/me", auth, async (req, res) => {
  // View logged in user profile
  //console.log(req.createAt)
  //const data = jwt.verify(token, process.env.JWT_SECRET)
  // console.log('-----', auth().)
  
  // const token = req.header("Authorization").replace("Bearer ", "");
  // const data = jwt.verify(token, JWT_SECRET);
  // //console.log(data.email)
  // try {
  //   const user = await User.findOne({ _id: data.id }).lean();
  //   res.send(user);

  //   //req.user=user
  // } catch (e) {
  //   console.log(e);
  // }
  console.log('----', req.user);
   res.send(req.user);
});
app.get("/", async (req, res) => {
  return res.status(200).json({
    message: "Tên phải dài hơn"});
});

app.post("/api/change-fullname",auth, async (req, res) => {
  const { fullName } = req.body;
  const id =req.user._id;
  console.log(id);
  if (!fullName || typeof fullName !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }
  if (fullName.length < 5) {
    return res.status(400).json({
      message: "Tên phải dài hơn",
    });
  }
  try {
    await User.updateOne(
      { _id: id },
      {
        $set: { fullName: fullName },
      }
    );
    res.status(200).json({ status: "ok" });

  } catch (e) {
    console.log(e);
  }
});
app.post("/api/change-phoneNumber",auth, async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(phoneNumber);
  const id =req.user._id;
  if (phoneNumber.length < 10 || phoneNumber.length > 11) {
    return res.status(400).json({
      message: "Số điện thoai chưa đúng định dạng!!",
    });
  }
  try {
    await User.updateOne(
      { _id: id},
      {
        $set: { phoneNumber: phoneNumber },
      }
    );
    res.status(200).json({ status: "ok" });
  } catch (e) {
    console.log(e);
  }
});
//change password
app.post("/api/change-password", async (req, res) => {
  const { token, password, newpassword: plainTextPassword } = req.body;
  const users = await jwt.verify(
    token,
    "sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk"
  );
  const username = users.username;
  //console.log(username)
  const user = await User.findOne({ username }).lean();
  //console.log(user)
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Mật khẩu phải có từ  5 ký tự",
    });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      const user = jwt.verify(token, JWT_SECRET);

      const _id = user.id;

      const password = await bcrypt.hash(plainTextPassword, 10);

      await User.updateOne(
        { _id },
        {
          $set: { password },
        }
      );
      res.json({ status: "ok" });
    } else {
      res.json({ status: "error", error: "Mật khẩu cũ không đúng" });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "thieu thuoc tinh" });
  }
});

//FOOTBALL PITCH (BILL)

app.post("/api/book-football-pitch", async (req, res) => {
  //const token = req.header('Authorization').replace('Bearer ','')
  //const data =  jwt.verify(token, JWT_SECRET)

  const {
    customer,
    phone,
    pitchName,
    startTime,
    date,
    price,
    comment,
    username,
  } = req.body;

  try {
    const response = await Football.create({
      customer,
      phone,
      pitchName,
      startTime,
      date,
      price,
      comment,
      username,
    });
    response.save();
    // http://localhost:3000/api/book-football-pitch
    console.log("Thanh Cong", response);
  } catch (error) {
    console.log("loi roi", error);
  }
  res.json({ status: "ok" });
});

// API FETCH FORM DATA PITCH EVERY DAY

app.post("/api/football-booking", async (req, res) => {
  const id = req.body.id;// id cua ngay dat
  const idSlot = req.body.idSlot;
  try {
    await dataPitch.updateOne(
      { _id: id, "footballPitch.id": idSlot },
      {
        $set: {
          "footballPitch.$.status": "payed",
          //"items.$.value": "yourvalue",
        },
      }
    );
    // console.log(JSON.stringify(dataPitche));
    // res.json(dataPitche);
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
  }
});
// API UPDATE FORM DATA PITCH EVERY DAY

app.post("/api/football-pitch-time-list", auth, async (req, res) => {
  const pitchType =req.body.pitchType;
  const dateTime =req.body.dateTime;
  const pitchName =req.body.pitchName;
  const pitchId =req.body.pitchId;
  console.log('pitchType----',pitchType);
  console.log('dateTime----',dateTime);
  console.log('pitchName----',pitchName);
  if(!pitchId||!pitchType || !dateTime || !pitchName) {
    return res.status(401).json({message:" error api get list footbal"});
  }
  footballPitch=[
    {
        id:"1",
        timeSlot:"06:00-07:00",
        timeStart:6,
        timeEnd:7,
        price:"500.000",
        status:"pending"
    },
    {
        id:"2",
        timeSlot:"07:00-08:00",
        timeStart:7,
        timeEnd:8,
        price:"500.000",
        status:"pending"
    },
    {
        id:"3",
        timeSlot:"08:00-09:00",
        timeStart:8,
        timeEnd:9,
        price:"500.000",
        status:"pending"
    },
    {
        id:"4",
        timeSlot:"09:00-10:00",
        timeStart:9,
        timeEnd:10,
        price:"500.000",
        status:"pending"
    },
    {
        id:"5",
        timeSlot:"10:00-11:30",
        timeStart:10,
        timeEnd:12,
        price:"500.000",
        status:"pending"
    },
    {
        id:"6",
        timeSlot:"15:00-16:00",
        timeStart:15,
        timeEnd:16,
        price:"500.000",
        status:"pending"
    },
    {
        id:"7",
        timeSlot:"16:00-17:00",
        timeStart:16,
        timeEnd:17,
        price:"500.000",
        status:"pending"
    },
    {
        id:"8",
        timeSlot:"17:00-18:00",
        timeStart:17,
        timeEnd:18,
        price:"500.000",
        status:"pending"
    },
    {
        id:"9",
        timeSlot:"18:00-19:00",
        timeStart:18,
        timeEnd:19,
        price:"500.000",
        status:"pending"
    },
    {
        id:"10",
        timeSlot:"19:00-20:00",
        timeStart:19,
        timeEnd:20,
        price:"500.000",
        status:"pending"
    },
     {
        id:"11",
        timeSlot:"20:00-21:00",
        timeStart:20,
        timeEnd:21,
        price:"500.000",
        status:"pending"
    },
     {
        id:"12",
        timeSlot:"21:00-23:00",
        timeStart:21,
        timeEnd:23,
        price:"500.000",
        status:"pending"
    },           
   
]

  try {
    const data = await dataPitch.findOne({pitchName:pitchName, pitchType:pitchType, dateTime: dateTime });
    if(data!==null){
      res.status(200).json(data);
    }
    else{
      console.log('vaoday lam gi', data);
      const newData =await dataPitch.create({
        pitchName,
        pitchId,
        dateTime,
        pitchType,
        footballPitch
      })
      newData.save();
    res.status(200).json(newData);
      }

  } catch (error) {
    console.log('err',error)
  }

});
// create-pitch
app.post("/api/create-pitch", auth, async (req, res) => {
  try{
  await FootballPitch.create({});
  res.status(200).json({message:'success'})
  }catch(error){
    return res.json({'error' : error})
  }
});
// add-pitch
app.post("/football/add-pitch",auth, async (req, res) => {
  const { pitchName, code, openTime, closeTime, location, minPrice,maxPrice, content, imgArray,latitude, longitude  } = req.query;
  const title= 'Thông tin sân'
  uploadMultiple(req, res, async(error)=>{
      if(error){
        console.log(error);
      }else{
        try {
          const data =req.files;
          const lastData=data[data.length-1];
          console.log('mmmm---', lastData);
            const image= {
              name: lastData.filename,
              data: fs.readFileSync('/Users/macmini/Documents/API/Images/'+lastData.filename),
              contentType: 'image/png'
           }
           const imgArray =data.map(i=>({
              name: i.filename,
              data: fs.readFileSync('/Users/macmini/Documents/API/Images/'+i.filename),
              contentType: 'image/png'

           }))
           console.log('mn11---', imgArray);
           const response = await FootballPitch.updateOne({
                 $push:{
                   pitchs:[
                     {
                       pitchName,
                       code,
                       openTime,
                       closeTime,
                       location,
                       minPrice,
                       maxPrice,
                       image,
                       title,
                       content,
                       imgArray,
                       latitude,
                       longitude 
                     }
                   ]
                 }
               })
               return  res.status(200).json({message:'success', image:image.image})
       } catch (err) {
        console.error(err);
        return res.status(400).json({err: err})
       }
      }
    })
});
// get pitch football list
app.get("/api/pitch-list",auth, async (req, res) => {
  const id = "632a84ada56a701c8719c6e3";
  try {
    const data = await FootballPitch.findOne({ _id: id }).lean();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

////get INFO
app.get("/api/pitch-detail",auth, async (req, res) => {
  const code = req.query.code;
  try {
    const info = await footballPitchDetail.findOne({ code: code }).lean();
    res.json(info);
  } catch (error) {
    console.log(error);
  }
});
//Cable create
app.post("/football/init-teams",auth, async (req, res) => {
  try {
    const response = await FindAwayTeam.create({
      $push: {
        data: [],
      },
    });
    response.save();
    console.log("Successfully init-teams", response);
  } catch (error) {
    console.log("error init-teams", error);
    res.status(401).json({error:error});
  }
  res.status(200).json({message:'Successfully init-teams'});
});

app.post("/football/create-teams", async (req, res) => {
  const {
    pitchName,
    location,
    timeSlot,
    dateTime,
    dateTimeHH,
    pitchPrice,
    team,
    contact,
    phoneNumber,
    message,
    userName,
  } = req.body;
  if(!pitchName || !location||!timeSlot||!dateTime||!dateTimeHH||!pitchPrice||!team||!contact||!phoneNumber||!message||!userName){
      res.status(400).json({error:"Error fields"});
  }
  const teamName2 = "";
  const phoneNumber2 = "";
  const message2 = "";
  const isStatus = "open";
  try {
    const response = await FindAwayTeam.updateMany({
      $push: {
        data: {
          pitchName,
          location,
          timeSlot,
          dateTime,
          dateTimeHH,
          pitchPrice,
          team,
          contact,
          phoneNumber,
          message,
          teamName2,
          phoneNumber2,
          message2,
          isStatus,
          userName,
        },
      },
    });
    res.status(200).json({ message: "Successfully Create-teams" });
  } catch (error) {
    console.log("error create-teams", error);
    res.status(400).json({error:error});
  }
});

app.post("/football/update-team-list", async (req, res) => {
  const {id, teamName2,message2,status}=req.body;
  console.log("id----", id);
  console.log("id----", teamName2);
  console.log("id----", status);
  const idParent = "630c22e49ac5455fd7be3d84";
  if(!teamName2){
    res.status(400).json({error:"missing field"})
  }
  try {
    const response = await FindAwayTeam.updateOne(
      { _id: idParent, "data._id": id },
      {
        $set: {
          "data.$.isStatus": status,
          "data.$.teamName2": teamName2,
          "data.$.message2": message2,
        },
      }
    );
    res.status(200).json({ message: "ok" });
    console.log(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", error: error });
  }
});
app.post("/football/update-team-list-request", async (req, res) => {
  const {id, status}=req.body;
  console.log("id----", status);
  const idParent = "630c22e49ac5455fd7be3d84";

  try {
    const response = await FindAwayTeam.updateOne(
      { _id: idParent, "data._id": id },
      {
        $set: {
          "data.$.isStatus": status,
        },
      }
    );
    res.status(200).json({ message: "ok" });
    console.log(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", error: error });
  }
});
//cable getList
app.get("/football/team-list",auth, async (req, res) => {
  const id = "630c22e49ac5455fd7be3d84";

  try {
    const info = await FindAwayTeam.findOne({ _id: id }).lean();
    const dataFilter = _.filter(info.data, (o) => {
      const today = moment().format("DD/MM/YYYY HH ");
      let isAfter = moment(o.dateTimeHH, "DD/MM/YYYY HH ").isSameOrAfter(
        moment(today, "DD/MM/YYYY HH")
      );
      if (isAfter) {
        // const duration = moment.duration(end.diff(o.dateTimeHH));
        // var hours = duration.asHours();
        // console.log('hh',hours);
        const diff = moment(o.dateTimeHH, "DD/MM/YYYY HH ").diff(moment(today, "DD/MM/YYYY HH" ));
        console.log('diff---',diff/3600) 
        if (diff/3600 >= 2000) {
          return o;
        }
        // if(hours <=1){
        //   return o;
        // }
       // return o;
      }
    });
    console.log(dataFilter);
  res.status(200).json({ size: dataFilter.length, dataFilter });
  } catch (error) {
    console.log(error,'error ---- get list team ----');
    res.status(400).json({error:error});
  }
});
////customerDetail----Bill
app.post("/football/create-bill",auth, async (req, res) => {
  //const token = req.header('Authorization').replace('Bearer ','')
  //const data =  jwt.verify(token, JWT_SECRET)
  const {
    pitchName,
    timeSlot,
    timeBookingDateTime,
    date,
    customerName,
    numberPhone,
    comment,
    pricePitch,
    dataService,
    location,
    total,
    userName,
  } = req.body;
  const timeBooking=timeBookingDateTime;
  console.log('aaaaa----', pitchName);
  try {
    const response = await CustomerDetail.create({
      pitchName,
      timeSlot,
      timeBooking,
      date,
      customerName,
      numberPhone,
      comment,
      pricePitch,
      dataService,
      location,
      total,
      userName,
    });
    response.save();
    // http://localhost:3000/api/book-football-pitch
    console.log("Thanh Cong", response);
  } catch (error) {
    console.log("loi roi", error);
  }
  res.json({ status: "ok" });
});

app.post("/football/customer-order",auth, async (req, res) => {
  const username  = req.query.username;
  console.log("user--", username);
  try {
    dates;
    const data = await CustomerDetail.find({ username: username }).lean();
    // const dataFilter = _.filter(data, (o) => {
    //   const today = moment().format("DD/MM/YYYY HH");
    //   let isAfter = moment(o.timeBooking, "DD/MM/YYYY ").isSameOrAfter(
    //     moment(today, "DD/MM/YYYY ")
    //   );
    //   if (isAfter) {
    //     // const diff = moment(o.timeBooking, "DD/MM/YYYY ").diff(moment());
    //     // if (diff >= 6) {
    //     //   return o;
    //     // }
    //     return o;
    //   }
    // });
    console.log(data);
    //const size =_.size(data)
    //	const size= {$size: data.length}
    res.json({ size: data.length, data });
    // console.log("Thanh Cong99",data,{ size: size})
  } catch (error) {
    console.log(error);
  }
});
//call Api get customer booking
app.get("/api/GETcustomer-booking", async (req, res) => {

  
  const { timeSlot, timeBooking, namePitch } = req.query;
  console.log(timeSlot);
  console.log(timeBooking);
  console.log(namePitch);

  const data = await CustomerDetail.find({ timeSlot: timeSlot, timeBooking:timeBooking, namePitch:namePitch }).lean();
  console.log(data);
  res.json(data);

})

///// -----------------------------------------------------------------------------------------------------------------
app.post("/api/update-bill", async (req, res) => {
  const id = req.query.id; // id collection
  const timeSlot = req.query.timeSlot;
  const timeBooking = req.query.timeBooking;

  console.log("id----", id);
  console.log("timeSlot----", timeSlot);
  console.log("timeBooking----", timeBooking);
 // const idParent = "62965a48b1310e75cc04a5a8";

  try {
    const response = await CustomerDetail.updateOne(
      { _id: id},
      {
        $set: {
          timeSlot: timeSlot,
          timeBooking: timeBooking,
        },
      }
    );
    res.json({ status: "ok" });
    console.log(response);
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: error });
  }
});
///----------------------------------------------------------------------------------------------------------------------------
//API chuyen doi khung gio
app.post("/api/data-pitch-update-reset", async (req, res) => {
  const code = req.query.code;// Code san
  const id = req.query.id; // id collection
  const idSlot = req.query.idSlot; //id khung gio do
  console.log("code ", code);
  console.log("id ", id);
  try {
    await dataPitch.updateOne(
      { _id: id, "footballPitch.id": idSlot },
      {
        $set: {
          "footballPitch.$.status": "open",
        
          //"items.$.value": "yourvalue",
        },
      }
    );
    // console.log(JSON.stringify(dataPitche));
    // res.json(dataPitche);
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
  }
});
///-----------------------------------------------------------------------------------------------------------------------------------
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

app.post('/checkout', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-08-27'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});
app.listen(3000, () => {
  console.log("Server up at 3000");
});
dates;
// const data = await CustomerDetail.find({ username: username }).lean();
// const dataFilter = _.filter(data, (o) => {
//   const today = moment().format("DD/MM/YYYY HH");
//   let isAfter = moment(o.timeBooking, "DD/MM/YYYY HH").isSameOrAfter(
//     moment(today, "DD/MM/YYYY HH")
//   );
//   if (isAfter) {
//     const diff = moment(o.timeBooking, "DD/MM/YYYY HH").diff(moment());
//     if (diff >= 6) {
//       return o;
//     }
//   }
// });
// console.log(dataFilter);
// //const size =_.size(data)
// //	const size= {$size: data.length}
// res.json({ size: dataFilter.length, dataFilter });
// // console.log("Thanh Cong99",data,{ size: size})
