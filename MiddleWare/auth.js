const jwt = require('jsonwebtoken')
const User = require("../Model/user");

const auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ','')
        if (!token) {
            return res.status(401).send('Không tìm thấy access token!');
        }
        const data = await jwt.verify(token,'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk')
       const user = await User.findOne({ _id: data.id }).lean();
       //res.send(user);
       req.user=user
        // req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth