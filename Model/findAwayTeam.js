const mongoose= require('mongoose');

const findAwayTeamSchema=new mongoose.Schema(
    {
        data:[
            {
                pitchName:{ type: String,required: true},
                location:{ type: String,required: true},
                timeSlot:{ type: String,required:true},
                dateTime:{ type: String,required: true},
                dateTimeHH:{ type: String,required: true},
                pitchPrice:{ type: String,required: true},
                team:{ type: String,required: true},
                contact:{ type: String,required: true},
                phoneNumber:{ type: String,},
                message:{ type: String,},
                teamName2:{ type: String,},
                message2:{ type: String,},
                isStatus:{ type: String,required: true},
                userName: { type: String, required: true, },
            }
        ]
    },
    {collection:"FindAwayTeam"}
)

const FindAwayTeam= mongoose.model("findAwayTeamSchema",findAwayTeamSchema);

module.exports=FindAwayTeam;