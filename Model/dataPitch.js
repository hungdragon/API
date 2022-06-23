const mongoose = require('mongoose')

const dataPitch =new mongoose.Schema(
   {
    dateTime:{type: String},
    pitchName:{ type: String},
    idPitch:{type: String, required: true},
    code:{ type: String, required: true,},
    typePitch:{ type: String},
    footballPitch:{type : Array , "default" : []},
    total:{ type: String}
   },
   {collection:'dataPitch'}
)
const dataModel= mongoose.model('dataPitchSchema',dataPitch)
module.exports=dataModel;