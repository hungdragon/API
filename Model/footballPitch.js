const mongoose= require('mongoose');

const footballPitch_Schema=new mongoose.Schema(
    {
    pitchs: [
      {
        //id:{ type: Number,required: true},
        pitchName:{ type: String},
        code:{ type: String, unique: true},
        maxPrice:{ type: String},
        minPrice:{ type: String},
        closeTime:{ type: String},
        openTime:{ type: String},
        location:{ type: String},
        image:{ 
          name: {type: String},
          data: {type: Buffer},
          contentType: {type: String},
        },
        rate:{ type: Number},
        title:{ type: String},
        content:{ type: String},
        imgArray:{ type: Array,"default" : []},
       // km:{ type: String,}
        longitude: {type: Number},
        latitude: {type: Number},
      }
     ]
    },
    {collection:"footballPitch"}
)

const FootballPitch= mongoose.model("footballPitch_Schema",footballPitch_Schema);

module.exports=FootballPitch;
