const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		email: { type: String, required: true },
		fullName: { type: String, required: true },
        avartar: { type: String, },
        createAt: { type: String, },
        isAdmin:{ type: String, },
        phoneNumber:{ type: String, },
        // isDeleted:{type:Boolean},
        
	},
	{ collection: 'users' }
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model