import { config } from 'dotenv'
config()
import JWT from 'jsonwebtoken'
import colors from 'colors'
import User from '../models/userModel.js'

export const verifyUser = async (req, res, next) => {

    try {
        const verifiedUserId = await JWT.verify(req.headers['authorization'], process.env.JWT_SECRETE_KEY)

        req.userId = verifiedUserId._id;
        console.log(`jwt authantication successfull for user Id = ${verifiedUserId._id}`.bgCyan.yellow)
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "authantication failed please relogin once!"
        })
    }
}


export const verifyAdmin = async (req, res, next) => {

    try {
        // getting user
        const user = await User.findById(req.userId)

        // checking role of user 
        if (user.role !== 1) {
            return res.status(401).json({
                success: false,
                message: "sorry only admin can perform this action!"
            })
        }
        else if (user.role === 1) {
            console.log(`admin authantication successfull for user = ${user.name}`.bgCyan.yellow)
            next()

        }



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "sorry something went wrong"
        })
    }
}