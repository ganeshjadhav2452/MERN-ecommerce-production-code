import express from 'express'
import colors from 'colors'
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js'
import authRoutes from './routes/authRoute.js'
import cors from 'cors'
import categoryRoutes from './routes/categoryRoutes.js'
import ProductRoutes from './routes/productRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url';
// configuring env file
dotenv.config()

// database config
connectDB()
//rest object
const app = express();

// middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// es6 fixed
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//rest api
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/product', ProductRoutes)
app.use(express.static(path.join(__dirname, "./client/build")))

// inital call
app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))

})

//port


app.listen(process.env.PORT, () => console.log(`server started on port ${process.env.PORT}`.bgBlack.yellow))