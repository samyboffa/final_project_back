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
    try {
        const result = await Order.findOneAndUpdate(
            { orderNumber: req.body.orderNumber },
            { status: req.body.operation }
        );
        console.log(result.clientId);
        const user = await User.findOneAndUpdate(
            { _id: result.clientId },
            { $push: { notifications: [{ msg: req.body.msg, read: false }] } }
        );
        console.log("useruser");
        console.log(user);
        res.status(200).send("Order Updated");
    } catch (error) {
        res.status(400).send("impossible To Update Orders");
    }
});

module.exports = router;
