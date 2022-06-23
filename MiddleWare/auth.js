const jwt = require('jsonwebtoken')


const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ','')
   
    try {
        const user = await jwt.verify(token,'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk')
       // req.user = user.username,
        req.user=user
        
        // req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}
module.exports = auth