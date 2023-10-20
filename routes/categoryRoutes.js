import { Router } from 'express'
import { verifyAdmin, verifyUser } from '../middlewares/authMiddleware.js'
import { createCategoryController, getAllCategoriesController, getSingleCategoryController, updateCategoryController, deleteCategoryController } from '../controllers/CategoryControllers.js'

const router = Router()


// category routes

// create category
router.post('/create-category', verifyUser, verifyAdmin, createCategoryController)

// update category
router.put('/update-category/:id', verifyUser, verifyAdmin, updateCategoryController)

// get all categorie's
router.get('/get-category', getAllCategoriesController)

// get single category
router.get('/single-category/:slug', getSingleCategoryController)

// delete category 
router.delete('/delete-category/:id', verifyUser, verifyAdmin, deleteCategoryController)
export default router