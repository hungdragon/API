const mongoose= require('mongoose');

const CableSchema=new mongoose.Schema(
    {
        data:[
            {
                namePitch:{ type: String,required: true},
                location:{ type: String,required: true},
                timeSlot:{ type: String,required:true},
                dateTime:{ type: String,required: true},
                dateTimeHH:{ type: String,required: true},
                price:{ type: String,required: true},
                team:{ type: String,required: true},
                contact:{ type: String,required: true},
                phoneNumber:{ type: String,},
                message:{ type: String,},
                team2:{ type: String,},
                message2:{ type: String,},
                isStatus:{ type: String,required: true},
                username: { type: String, required: true, },
            }
        ]
    },
    {collection:"Cable"}
)

const Cable= mongoose.model("CableSchema",CableSchema);

module.exports=Cable;