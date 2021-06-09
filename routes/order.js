const Order = require("../model/Order");
const router = require("express").Router();
const adminRoute = require("../middelwares/adminRoute");
const uniqId = require("uniqid");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const privateRoute = require("../middelwares/privateRoute");

router.post("/newOrder", privateRoute, async (req, res) => {
    const order = new Order({
        clientId: req.body.clientId,
        products: req.body.products,
        totalPrice: req.body.totalPrice,
        orderNumber: uniqId("BSHOP-"),
    });
    //return console.log(order);
    try {
        const savedOrder = await order.save();
        await User.findByIdAndUpdate(req.body.clientId, { cart: [] });
        res.status(200).send("OrderSaved");
    } catch (error) {
        console.log(error);
    }
});

router.get("/getMyOrders", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);
    try {
        const result = await Order.find({ clientId: id._id });
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

router.get("/getAllOrders", adminRoute, async (req, res) => {
    try {
        const result = await Order.find({});
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

router.post("/changeStatusOrders", adminRoute, async (req, res) => {
    if (req.body.operation === "Complete") {
        const order = await Order.findOne({
            orderNumber: req.body.orderNumber,
        });
        let products = order.products;
        let keys = Object.values(req.body.keys);
        for (let i = 0; i < products.length; i++) {
            products[i] = { ...products[i], key: keys[i] };
        }
        try {
            await Order.updateOne(
                { orderNumber: req.body.orderNumber },
                { $set: { products: products, status: "Complete" } }
            );
            await User.updateOne(
                { _id: order.clientId },
                {
                    $push: {
                        notifications: [{ msg: req.body.msg, read: false }],
                    },
                }
            );
            return res.status(200).send("Order Complete");
        } catch (error) {
            return res.status(400).send("Server Error");
        }
    }
    if (req.body.operation === "Preparing") {
        try {
            const result = await Order.findOneAndUpdate(
                { orderNumber: req.body.orderNumber },
                { status: "Preparing" }
            );

            await User.findOneAndUpdate(
                { _id: result.clientId },
                {
                    $push: {
                        notifications: [{ msg: req.body.msg, read: false }],
                    },
                }
            );

            res.status(200).send("Order Being Prepared");
        } catch (error) {
            res.status(400).send("impossible To Update Orders");
        }
    }
});

module.exports = router;
