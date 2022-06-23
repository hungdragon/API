const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const Cable = require("./model/cable");
const dataPitch = require("./model/dataPitch");
const CustomerDetail = require("./model/bookFootball");
const FootballPitch = require("./model/footballPitch");
const footballPitchDetail = require("./model/footballPitchDetail");
const auth = require("./Middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cors = require("cors");
const date = require("date-and-time");
const JWT_SECRET =
  "sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk";
var _ = require("lodash");
var moment = require("moment");
var dates = require("date-fns");
moment.locale("vi");
const { boolean } = require("webidl-conversions");
mongoose.connect("mongodb://localhost:27017/MyDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useCreateIndex: true
});

const app = express();
app.use(cors());

app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("user---" + username);
  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: 404, error: "Không tồn tại tài khoản !" });
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

    return res.json({
      status: "ok",
      token: _token,
      isAdmin: isAdmin,
      username: user.username,
    });
    //return res.status(200).send(({token:_token}))
  }

  //return res.status(401).send(({message:"Invalid username/password"}))
  //return res.send({error:404,message:"loi dang nhao roi"})
  return res.json({
    status: 401,
    error: "Tài khoản hoặc mật khẩu không chính xác !",
  });
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
  const fullName = "hi";
  const isAdmin = "0";
  const phoneNumber = " ";
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
app.get("/users/me", async (req, res) => {
  // View logged in user profile
  //console.log(req.createAt)
  //const data = jwt.verify(token, process.env.JWT_SECRET)
  const token = req.header("Authorization").replace("Bearer ", "");
  const data = jwt.verify(token, JWT_SECRET);
  //console.log(data.email)
  try {
    const user = await User.findOne({ _id: data.id }).lean();
    res.send(user);

    //req.user=user
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/change-fullname", async (req, res) => {
  const { fullName } = req.body;
  console.log(fullName);
  const token = req.header("Authorization").replace("Bearer ", "");
  const data = jwt.verify(token, JWT_SECRET);
  //const _id=data.id
  if (!fullName || typeof fullName !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }
  if (fullName.length < 5) {
    return res.json({
      status: "error",
      error: "Tên phải dài hơn",
    });
  }
  try {
    await User.updateOne(
      { _id: data.id },
      {
        $set: { fullName: fullName },
      }
    );
    res.json({ status: "ok", FullNameUser: fullName });
  } catch (e) {
    console.log(e);
  }
});
app.post("/api/change-phoneNumber", async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(phoneNumber);
  const token = req.header("Authorization").replace("Bearer ", "");
  const data = jwt.verify(token, JWT_SECRET);
  //const _id=data.id
  console.log("55", data.id);

  if (phoneNumber.length < 10 || phoneNumber.length > 11) {
    return res.json({
      status: "error",
      error: "So dien thoai chua dung",
    });
  }
  try {
    await User.updateOne(
      { _id: data.id },
      {
        $set: { phoneNumber: phoneNumber },
      }
    );
    res.json({ status: "ok", PhoneNumbers: phoneNumber });
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

app.post("/api/data-pitch-update", async (req, res) => {
  const code = req.query.code;
  const id = req.query.id;
  const idSlot = req.query.idSlot;
  console.log("code---a ", code);
  console.log("id---a ", id);
  console.log("id---a ", idSlot);
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

app.post("/api/data-pitch", async (req, res) => {
  const code = req.query.code;
  const typePitch =req.query.typePitch;
  const idPitch = req.query.idPitch;

  const dateTime =req.query.dateTime;
  pitchName =req.query.pitchName;
  console.log('code----',code);
  console.log('typePitch----',typePitch);
  console.log('idPitch----',idPitch);
  console.log('dateTime----',dateTime);
  console.log('pitchName----',pitchName);

  footballPitch=[
    {
        id:"1",
        timeSlot:"06:00-07:00",
        timeStart:"6",
        timeEnd:"7",
        price:"500.000",
        status:"pending"
    },
    {
        id:"2",
        timeSlot:"07:00-08:00",
        timeStart:"7",
        timeEnd:"8",
        price:"500.000",
        status:"pending"
    },
    {
        id:"3",
        timeSlot:"08:00-09:00",
        timeStart:"8",
        timeEnd:"9",
        price:"500.000",
        status:"pending"
    },
    {
        id:"4",
        timeSlot:"09:00-10:00",
        timeStart:"9",
        timeEnd:"10",
        price:"500.000",
        status:"pending"
    },
    {
        id:"5",
        timeSlot:"10:00-11:30",
        timeStart:"10",
        timeEnd:"12",
        price:"500.000",
        status:"pending"
    },
    {
        id:"6",
        timeSlot:"15:00-16:00",
        timeStart:"15",
        timeEnd:"16",
        price:"500.000",
        status:"pending"
    },
    {
        id:"7",
        timeSlot:"16:00-17:00",
        timeStart:"16",
        timeEnd:"17",
        price:"500.000",
        status:"pending"
    },
    {
        id:"8",
        timeSlot:"17:00-18:00",
        timeStart:"17",
        timeEnd:"18",
        price:"500.000",
        status:"pending"
    },
    {
        id:"9",
        timeSlot:"18:00-19:00",
        timeStart:"18",
        timeEnd:"19",
        price:"500.000",
        status:"pending"
    },
    {
        id:"10",
        timeSlot:"19:00-20:00",
        timeStart:"19",
        timeEnd:"20",
        price:"500.000",
        status:"pending"
    },
     {
        id:"11",
        timeSlot:"20:00-21:00",
        timeStart:"20",
        timeEnd:21,
        price:"500.000",
        status:"pending"
    },
     {
        id:"12",
        timeSlot:"21:00-23:00",
        timeStart:"21",
        timeEnd:"23",
        price:"500.000",
        status:"pending"
    },           
   
]

  console.log("code" + code);
  try {
    const obj = await dataPitch
      .findOne({ idPitch: idPitch,code: code ,typePitch:typePitch }).lean();

    console.log('dsad===',obj)

    if(obj !==null){
      console.log('aaaaa')
      res.json(obj);
    }
    if(obj===null){
      console.log('bbbb')
      const newDay =await dataPitch.create({
        dateTime,
        pitchName,
        idPitch,
        code,
        typePitch,
        footballPitch
      })
     // newDay.save();
      res.json(newDay)
    }
  } catch (error) {
    console.log(error);
  }
});

// FOOTBALL PITCH
app.get("/api/football-pitch-ad", async (req, res) => {
  const id = "62a4150279efdb406016967b";
  try {
    const data = await FootballPitch.findOne({ _id: id }).lean();
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

////get INFO
app.get("/api/football-detail", async (req, res) => {
  const code = req.query.code;
  try {
    const info = await footballPitchDetail.findOne({ code_name: code }).lean();
    res.json(info);
  } catch (error) {
    console.log(error);
  }
});
//Cable create
app.post("/api/create-cable", async (req, res) => {
  try {
    const response = await Cable.create({
      $push: {
        data: [],
      },
    });
    response.save();
    // http://localhost:3000/api/book-football-pitch
    console.log("Thanh Cong", response);
  } catch (error) {
    console.log("loi roi", error);
  }
  res.json({ status: "ok" });
});

app.post("/api/add-cable", async (req, res) => {
  const {
    namePitch,
    location,
    timeSlot,
    dateTime,
    dateTimeHH,
    price,
    team,
    contact,
    phoneNumber,
    message,
    username,
  } = req.body;

  console.log("4444", username);
  const team2 = "";
  const phoneNumber2 = "";
  const message2 = "";
  const isStatus = "open";
  try {
    const response = await Cable.updateMany({
      $push: {
        data: {
          namePitch,
          location,
          timeSlot,
          dateTime,
          dateTimeHH,
          price,
          team,
          contact,
          phoneNumber,
          message,
          team2,
          phoneNumber2,
          message2,
          isStatus,
          username,
        },
      },
    });
    res.json({ status: "ok" });
    // http://localhost:3000/api/book-football-pitch
    //	console.log("Thanh Cong",response)
  } catch (error) {
    console.log("loi roi", error);
  }
});

app.post("/api/update-cable", async (req, res) => {
  const id = req.query.id;
  const status = req.query.status;
  const nameTeam = req.query.nameTeam;
  const message = req.query.message;
  console.log("id----", id);
  console.log("id----", nameTeam);
  console.log("id----", status);
  const idParent = "62965a48b1310e75cc04a5a8";

  try {
    const response = await Cable.updateOne(
      { _id: idParent, "data._id": id },
      {
        $set: {
          "data.$.isStatus": status,
          "data.$.team2": nameTeam,
          "data.$.message2": message,
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
//cable getList
app.get("/api/get-cableList", async (req, res) => {
  const id = "62965a48b1310e75cc04a5a8";

  try {
    const info = await Cable.findOne({ _id: id }).lean();
  
    //  const data = await CustomerDetail.find({ username: username }).lean();
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
    //const size =_.size(data)
    //	const size= {$size: data.length}
  res.json({ size: dataFilter.length, dataFilter });
    // console.log("Thanh Cong99",data,{ size: size})
  } catch (error) {
    console.log(error);
  }
});
////customerDetail
app.post("/api/customer-detail", async (req, res) => {
  //const token = req.header('Authorization').replace('Bearer ','')
  //const data =  jwt.verify(token, JWT_SECRET)

  const {
    namePitch,
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
    username,
  } = req.body;

  try {
    const response = await CustomerDetail.create({
      namePitch,
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

app.post("/api/GETcustomer-detail", async (req, res) => {
  const { username } = req.body;
  console.log("user--", username);
  try {
    dates;
    const data = await CustomerDetail.find({ username: username }).lean();
    const dataFilter = _.filter(data, (o) => {
      const today = moment().format("DD/MM/YYYY HH");
      let isAfter = moment(o.timeBooking, "DD/MM/YYYY ").isSameOrAfter(
        moment(today, "DD/MM/YYYY ")
      );
      if (isAfter) {
        // const diff = moment(o.timeBooking, "DD/MM/YYYY ").diff(moment());
        // if (diff >= 6) {
        //   return o;
        // }
        return o;
      }
    });
    console.log(dataFilter);
    //const size =_.size(data)
    //	const size= {$size: data.length}
    res.json({ size: dataFilter.length, dataFilter });
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

app.listen(3000 || 4000, () => {
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
