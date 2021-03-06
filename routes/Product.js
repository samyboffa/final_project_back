const router = require("express").Router();
const adminRoute = require("../middelwares/adminRoute");
const Product = require("../model/Product");

router.get("/getProduct", async (req, res) => {
    Product.find({})
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
});
router.get("/getGames", async (req, res) => {
    var re = new RegExp(req.headers.input, "i");

    Product.find({ $and: [{ type: "GAME" }, { name: { $regex: re } }] })
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
});

router.get("/getProductById/:id", async (req, res) => {
    //must find one by id
    Product.findById(req.params.id)
        .then((data) => res.status(200).send(data))
        .catch((err) =>
            res.status(400).send("server Error Please Try Again Later")
        );
});

router.get("/searchProduct", async (req, res) => {
    //must find one by name
    var re = new RegExp(req.headers.input, "i");

    Product.find({ description: { $regex: re } })
        .limit(10)
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
});
//admin routes
//modify - delete

router.post("/addProduct", adminRoute, async (req, res) => {
    const newProduct = new Product({
        name: req.body.name,
        type: req.body.type,
        region: req.body.region,
        platform: req.body.platform,
        store: req.body.store,
        value: req.body.value,
        currency: req.body.currency,
        originalPrice: req.body.originalPrice,
        currentPrice: req.body.currentPrice,
        description: req.body.description,
        img: req.body.img,
    });
    try {
        await newProduct.save();
        console.log("gamesaved");
        res.status(200).send("GameSaved");
    } catch (err) {
        res.send(err);
    }
});
router.post("/updateProduct", adminRoute, async (req, res) => {
    console.log(req.body);

    await Product.findOneAndUpdate(
        { _id: req.body.id },
        {
            name: req.body.newName,
            region: req.body.newRegion,
            platform: req.body.newPlatform,
            originalPrice: req.body.newOriginalPrice,
            currentPrice: req.body.newCurrentPrice,
            img: req.body.newImg,
        }
    )
        .then(() => res.status(200).send("productUpadeted"))
        .catch((err) => console.log(err));
});
router.post("/deleteProduct", adminRoute, async (req, res) => {
    try {
        await Product.findOneAndRemove({ _id: req.body.id });
        res.status(200).send("Product deleted");
    } catch (error) {
        res.send(error);
    }
});

router.post("/verifyAdmin", adminRoute, async (req, res) => {
    res.status(200).send("hello Admin");
});

module.exports = router;
