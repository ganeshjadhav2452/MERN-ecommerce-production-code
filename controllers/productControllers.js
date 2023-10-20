import { config } from "dotenv";
config()
import slugify from "slugify";
import Product from "../models/ProductModel.js";
import Category from '../models/CategoryModel.js'
import fs from "fs";
import braintree from "braintree";
import orderModel from '../models/orderModel.js'
// payment gateway Credential
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BTL_PUBLIC_ID,
    privateKey: process.env.BT_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
    const { name, quantity, slug, shipping, description, price, category } =
        req.fields;
    const { photo } = req.files;
    try {
        if (!name || !quantity || !description || !price || !category)
            return res.status(401).json({
                success: false,
                message: "please fill all  required fields",
            });

        const product = new Product({
            ...req.fields,
            slug: slugify(name),
        });
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }
        await product.save();

        return res.status(200).json({
            success: true,
            message: `product created successfully`,
            product,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "something went wrong while creating product...",
            error,
        });
    }
};

export const getProductsController = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .select("-photo")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: products.length,
            message: "successfully fetched all products",
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "error while getting products",
            error,
        });
    }
};

// get single product

export const getSingleProductController = async (req, res) => {
    const { slug } = req.params;

    try {
        const product = await Product.findOne({ slug })
            .populate("category")
            .select("-photo");

        return res.status(200).json({
            success: true,
            message: `fetched product successfully`,
            product,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "error while getting product",
            error,
        });
    }
};

// get photo

export const productPhotoController = async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await Product.findById(pid).select("photo");

        if (product.photo.data) {
            res.set("Content-Type", product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "error while getting photo",
            error,
        });
    }
};

// delete product

export const deleteProductController = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id).select("-photo");

        return res.status(200).json({
            success: true,
            message: "product delete successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "error while deleting product",
            error,
        });
    }
};

//upate producta
export const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } =
            req.fields;
        const { photo } = req.files;
        //validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is Required" });
            case !description:
                return res.status(500).send({ error: "Description is Required" });
            case !price:
                return res.status(500).send({ error: "Price is Required" });
            case !category:
                return res.status(500).send({ error: "Category is Required" });
            case !quantity:
                return res.status(500).send({ error: "Quantity is Required" });
            case photo && photo.size > 1000000:
                return res
                    .status(500)
                    .send({ error: "photo is Required and should be less then 1mb" });
        }

        const products = await Product.findByIdAndUpdate(
            req.params.pid,
            { ...req.fields, slug: slugify(name) },
            { new: true }
        );
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path);
            products.photo.contentType = photo.type;
        }
        await products.save();
        res.status(201).send({
            success: true,
            message: "Product Updated Successfully",
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            error,
            message: "Error in Updte product",
        });
    }
};

// get filtered products

export const getFilteredProductController = async (req, res) => {
    const { checked, radio } = req.body;

    try {
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }; //---> $gte = greater than equal , $lte = less than equal
        const products = await Product.find(args)
            .select("-photo")
            .populate("category");

        return res.status(200).json({
            success: true,
            message: "product successfully fetched by filters",
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while fetching products with filter",
            error,
        });
    }
};

// get product count

export const productCountController = async (req, res) => {
    try {
        const total = await Product.find({}).estimatedDocumentCount();

        return res.status(200).json({
            success: true,
            message: "total document number fetched successfully",
            total,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error in page ctrl",
            error,
        });
    }
};

// get product list based on page

export const productListController = async (req, res) => {
    const { page } = req.params.page ? req.params.page : 1;
    const perPage = 6;
    const skipvalue = (page - 1) * perPage;
    try {
        const products = await Product.find({})
            .select("-photo")
            .skip(skipvalue)
            .limit(perPage)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: `products fetched successfully for page ${page}`,
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while fetching products ",
            error,
        });
    }
};

// search product

export const searchProductController = async (req, res) => {
    const { keyword } = req.params;

    try {
        const result = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } }, //---> $options = not case sensitive
                { description: { $regex: keyword, $options: "i" } },
            ],
        }).select("-photo");

        return res.status(200).json({
            success: true,
            message: `products fetched successfully for keyword ${keyword}`,
            result,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while fetching product ",
            error,
        });
    }
};

// get realted products

export const relatedProductsController = async (req, res) => {
    const { pid, cid } = req.params;
    try {
        const products = await Product.find({ category: cid, _id: { $ne: pid } })
            .select("-photo")
            .populate("category")
            .limit(3); //---> $ne = not include

        return res.status(200).json({
            success: true,
            message: "similar products fetched successfully",
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while fetching related products ",
            error,
        });
    }
};

// get product category wise

export const getProductCategoryWiseController = async (req, res) => {
    const { slug } = req.params;
    try {
        const category = await Category.findOne({ slug: slug })
        const products = await Product.find({ category })
            .select("-photo")
            .populate("category")


        return res.status(200).json({
            success: true,
            message: "similar products fetched successfully",
            products,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while fetching related products ",
            error,
        });
    }
};


// payment gateway

export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, (err, response) => {
            if (err) {
                res.status(500).json(err)
            } else {
                res.status(200).json(response)
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while getting token",
            error,
        });
    }
}

// payment controller

export const paymentController = async (req, res) => {
    try {

        const { nonce, cart } = req.body;
        let total = 0;
        cart.map((i) => {
            total += i.price;
        });
        let newTransaction = gateway.transaction.sale(
            {
                amount: total,
                paymentMethodNonce: nonce,
                options: {
                    submitForSettlement: true,
                },
            },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.userId,
                    }).save();
                    res.json({ ok: true });
                } else {
                    res.status(500).send(error);
                }
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "error while processing your payment",
            error,
        });
    }
}