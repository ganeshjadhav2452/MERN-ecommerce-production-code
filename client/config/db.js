import mongoose from "mongoose";
import { config } from "dotenv";
config()

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DBURL)

        console.log(`database connected successfuly host name : ${connection.connection.host}`.bgBlack.yellow)
    } catch (error) {
        console.log(`error while connecting to mongodb==> ${error}`.bgRed.white)
    }
}

export default connectDB