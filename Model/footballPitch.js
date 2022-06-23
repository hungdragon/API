const mongoose= require('mongoose');

const footballPitch_Schema=new mongoose.Schema(
    {
    data: [
      {
        id:{ type: Number,required: true},
        pitchName:{ type: String,required:true},
        codeName:{ type: String,required:true},
        fullTimeSlot:{ type: String,required: true},
        location:{ type: String,required: true},
        price:{ type: String,required: true},
        image:{ type: String},
        km:{ type: String, required: true}
      }
     ]
    },
    {collection:"footballPitch"}
)

const FootballPitch= mongoose.model("footballPitch_Schema",footballPitch_Schema);

module.exports=FootballPitch;