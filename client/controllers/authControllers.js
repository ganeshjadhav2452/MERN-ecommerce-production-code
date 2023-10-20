
import { comparePassword, hashPssword } from '../helpers/authHelper.js';
import User from '../models/userModel.js'
import JWT from 'jsonwebtoken'
import { config } from 'dotenv';
import orderModel from '../models/orderModel.js';
config()

export const registerController = async (req, res) => {
    const { name, email, password, phone, address, answer } = req.body;


    try {
        if (!name || !email || !password || !phone || !address || !answer) return res.json({
            success: false,
            message: 'please fill all required fields'
        })

        // geting user if exists 
        const existingUser = await User.findOne({ email: email })

        if (existingUser) return res.status(200).json({
            success: false,
            message: `User with Email: ${email} is already Registered Please login`
        })

        // register user
        const hashedPassword = await hashPssword(password)

        const user = await new User({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            answer
        }).save()

        return res.status(201).json({
            success: true,
            message: "User Registered successfully",
            user: {
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,

            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error in Registration"
        }),
            error

    }
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) return res.status(404).json({
            success: false,
            message: "Email Or Password Cannot Be Empty !",

        })

        // check user 
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({
            success: false,
            message: `Sorry user with email ${email} is not registered please Signup`
        })
        // comparing hashed password with plain password received from client
        const match = await comparePassword(password, user.password)

        if (!match) return res.status(200).json({
            success: false,
            message: 'Invalid password'
        })

        // leting user log in by generating json web token

        if (match) {
            const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRETE_KEY, { expiresIn: '7d' });

            return res.status(200).json({
                success: true,
                message: "Login successfull",
                user: {
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    phone: user.phone,
                    role: user.role

                },
                token
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error in Login",
            error
        })
    }
}

//forgot password controller
export const forgotPasswordController = async (req, res) => {
    const { email, question, answer, newPassword } = req.body;

    try {
        if (!email || !question || !newPassword) return res.status(404).json({
            success: false,
            message: "please fill all required fields"
        })

        const user = await User.findOne({ email, answer })

        if (!user) return res.status(404).json({
            success: false,
            message: "wrong email or answer"
        })

        // hasing new password
        const hashed = await hashPssword(newPassword)
        await User.findByIdAndUpdate(user._id, {
            password: hashed
        })

        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully."
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error
        })

    }

}

// update profile

export const updateUserProfileController = async (req, res) => {
    const { name, address, email, phone } = req.body;
    try {
        const user = await User.findById(req.userId)

        // updating user 
        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            name: name || user.name,
            address: address || user.address,
            phone: phone || user.phone
        }, { new: true })

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedUser
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile",
            error
        })

    }
}

// orders

export const getOrdersController = async (req, res) => {

    try {
        const orders = await orderModel.find({ buyer: req.userId }).populate('products', '-photo').populate('buyer', "name")

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            orders
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "error while getting orders",
            error
        })

    }
}

//orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: "-1" });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error WHile Geting Orders",
            error,
        });
    }
};

//order status
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error While Updateing Order",
            error,
        });
    }
};