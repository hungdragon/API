const mongoose = require('mongoose')

const dataPitch =new mongoose.Schema(
   {
      pitchName:{ type: String,required: true},
      pitchId:{type: String, required: true},
      dateTime:{type: String,required: true},
      pitchType:{ type: String,required: true},
      footballPitch:{type : Array , "default" : []},
      //total:{ type: String}
   },
   {collection:'dataPitch'}
)
const dataModel= mongoose.model('dataPitchSchema',dataPitch)
module.exports=dataModel;