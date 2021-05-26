const router = require("express").Router();
const TopUp = require("../model/TopUp");

router.post("/", async (req, res) => {
    const topUp = new TopUp({
        name: req.body.name,
        platform: req.body.platform,
        currency: req.body.currency,
        topUp: req.body.topUp,
        description: req.body.description,
    });
    try {
        const savedTopUp = await topUp.save();
        res.send(savedTopUp);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
