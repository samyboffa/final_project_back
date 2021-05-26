const router = require("express").Router();
const TopUp = require("../model/TopUp");

router.get("/getTopUp", async (req, res) => {
    //must find one by name
    TopUp.findOne({ searchName: req.headers.searchname })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => console.log(err));
});
router.get("/getTopUps", async (req, res) => {
    //must find one by name
    TopUp.find()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => res.send(err));
});

module.exports = router;
