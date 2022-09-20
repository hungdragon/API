const mongoose= require('mongoose');

const BookFootballSchema=new mongoose.Schema(
    {

    pitchName:{ type: String,required: true},
    timeSlot:{ type: String,required: true},
    timeBooking:{ type: String,required:true},
    date:{ type: String,required:true},
    customerName:{ type: String,required: true},
    numberPhone:{ type: String},
    comment:{ type: String},
    pricePitch:{ type: String,required: true},
    dataService:[{
        nameService: String,
        codePrice: String,
        quantity: Number,
    }],
    location:{ type: String, required: true},
    total:{ type: String, required: true},
    userName:{ type: String, required: true}

    },
    {collection:"Bill"}
)

const BookFootballPitch= mongoose.model("BookFootballSchema",BookFootballSchema);

module.exports=BookFootballPitch;