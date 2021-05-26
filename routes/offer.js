const Offer = require("../model/Offer");
const User = require("../model/User");

const router = require("express").Router();
const uniqId = require("uniqid");
const jwt = require("jsonwebtoken");
const privateRoute = require("../middelwares/privateRoute");
const adminRoute = require("../middelwares/adminRoute");

router.post("/newOffer", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    const offer = new Offer({
        sellerId: user._id,
        sellerRate: user.rate,
        sellerName: user.name,
        sellerPhoneNumber: user.phoneNumber,
        itemName: req.body.itemName,
        itemDescription: req.body.itemDescription,
        itemPrice: req.body.itemPrice,
        itemType: req.body.itemType,
        itemNumber: uniqId("P2P-"),
    });

    try {
        await offer.save();
        res.status(200).send("ListingAdded");
    } catch (error) {
        res.send("Impossible To Add Listing");
    }
});

router.get("/getAllOffers", privateRoute, async (req, res) => {
    try {
        const result = await Offer.find();

        res.status(200).send(result);
    } catch (error) {
        res.send("Impossible To Get offers");
    }
});

router.get("/getMyOffers", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);

    try {
        const result = await Offer.find({ sellerId: id._id });

        res.status(200).send(result);
    } catch (error) {
        res.send("Impossible To Get offers");
    }
});
router.post("/editMyOffers", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const { itemNumber, itemName, itemType, itemDescription, itemPrice } =
        req.body;

    Offer.findOneAndUpdate(
        { itemNumber: itemNumber },
        {
            itemName: itemName,
            itemType: itemType,
            itemDescription: itemDescription,
            itemPrice: itemPrice,
            status: "Pending",
        }
    )
        .then((data) => res.status(200).send("OfferUpdated"))
        .catch((err) => console.log(err));
});

router.post("/deleteMyOffers", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const { itemNumber } = req.body;

    Offer.findOneAndRemove({ itemNumber: itemNumber })
        .then((data) => res.status(200).send("OfferDeleted"))
        .catch((err) => console.log(err));
});

router.post("/adminManageOffers", adminRoute, async (req, res) => {
    console.log(req.body);

    try {
        let updatedOffer = await Offer.findOneAndUpdate(
            { itemNumber: req.body.itemNumber },
            { status: req.body.operation }
        );
        await User.findOneAndUpdate(
            { _id: updatedOffer.sellerId },
            { $push: { notifications: [{ msg: req.body.msg, read: false }] } }
        );
        res.status(200).send("OfferUpdated");
    } catch (error) {
        res.status(400).send("Impossible To Update Offer");
    }
});
router.post("/clearRejectedOffers", adminRoute, async (req, res) => {
    console.log("object");
    try {
        await Offer.deleteMany({ status: "Rejected" });
        res.status(200).send("Cleared");
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;
