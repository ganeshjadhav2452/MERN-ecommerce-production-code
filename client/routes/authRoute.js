import express from 'express'
import { registerController, loginController, forgotPasswordController, updateUserProfileController, getOrdersController, getAllOrdersController, orderStatusController } from '../controllers/authControllers.js';
import { verifyUser, verifyAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router()

//register user
router.post('/register', registerController)

//login route
router.post('/login', loginController)

//forgot password
router.post('/forgot-password', forgotPasswordController)

//protected route auth for user
router.get('/user-auth', verifyUser, (req, res) => {
    res.status(200).json({ ok: true })
})

//protected route auth for admin
router.get('/admin-auth', verifyUser, verifyAdmin, (req, res) => {
    res.status(200).json({ ok: true })
})

//update profile

router.put('/profile', verifyUser, updateUserProfileController)

// get orders
router.get('/orders', verifyUser, getOrdersController)


//all orders
router.get("/all-orders", verifyUser, verifyAdmin, getAllOrdersController);

// order status update
router.put(
    "/order-status/:orderId",
    verifyUser,
    verifyAdmin,
    orderStatusController
);
export default router;
