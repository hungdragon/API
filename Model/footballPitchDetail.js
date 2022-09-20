const mongoose= require('mongoose');

const PitchDetail_Schema=new mongoose.Schema(
    {
    pitchName:{ type: String,required:true},
    code:{ type: String,required:true, unique: true},
    location:{ type: String,required: true},
    rate:{ type: Number,required: true},
    title:{ type: String,required: true},
    content:{ type: String,required: true},
    imgArray:{ type: Array,"default" : []},
    },
    {collection:"footballPitchDetail"}
)

const PitchDetail= mongoose.model("PitchDetail_Schema",PitchDetail_Schema);

module.exports=PitchDetail;