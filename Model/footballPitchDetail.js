const mongoose= require('mongoose');

const PitchDetail_Schema=new mongoose.Schema(
    {
    name_pitch:{ type: String,required:true},
    code_name:{ type: String,required:true},
    rate:{ type: Number,required: true},
    location:{ type: String,required: true},
    title:{ type: String,required: true},
    content:{ type: String,required: true},
    imgArray:{ type: Array,"default" : []},
    },
    {collection:"footballPitchDetail"}
)

const PitchDetail= mongoose.model("PitchDetail_Schema",PitchDetail_Schema);

module.exports=PitchDetail;