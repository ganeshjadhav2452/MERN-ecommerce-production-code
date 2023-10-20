import CategoryModel from "../models/CategoryModel.js";
import slugify from "slugify";

// create category
export const createCategoryController = async (req, res) => {
    const { name } = req.body;

    try {
        if (!name) return res.status(401).json({
            success: false,
            message: 'please provide name of category..'

        })

        const existingCategory = await CategoryModel.findOne({ name })

        if (existingCategory) return res.status(200).json({
            success: true,
            message: `category with name ${name} already exists.`
        })

        const category = await new CategoryModel({
            name: name,
            slug: slugify(name)
        }).save()

        return res.status(200).json({
            success: true,
            message: `category ${name} created successfully.`,

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'something went wrong while creating category',
            error
        })

    }

}

// update category
export const updateCategoryController = async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate({ _id: id }, {
            name: name,
            slug: slugify(name)
        }, {
            new: true
        })

        return res.status(200).json({
            success: true,
            message: `category changed successfuly to ${updatedCategory.name}`,
            updatedCategory
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: `something went wrong while updating...`,
            error
        })

    }
}

// get all categories

export const getAllCategoriesController = async (req, res) => {

    try {
        const categories = await CategoryModel.find()

        return res.status(200).json({
            success: true,
            message: "fetched all cotegories successfully",
            categories
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'something went wrong while getting categories...',
            error
        })

    }
}

// get single category

export const getSingleCategoryController = async (req, res) => {
    const { slug } = req.params;
    try {
        const category = await CategoryModel.findOne({ slug: slug });

        return res.status(200).json({
            success: true,
            message: `fetched category ${category.name} successfully`,
            category
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'something went wrong while getting category...',
            error
        })

    }
}

// delete category

export const deleteCategoryController = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCategory = await CategoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `deleted category ${deletedCategory.name} successfully`,
            deletedCategory
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'something went wrong while deleting category...',
            error
        })

    }
}
