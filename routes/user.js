const router = require("express").Router();
//importing user schema
const User = require("../model/User");
const TopUp = require("../model/TopUp");
//importing validation function
const {
    userValidation,
    loginValidation,
    updateValidation,
    passwordValidation,
} = require("../middelwares/validation");
//importing bcrypt
const bcrypt = require("bcryptjs");
//importing JWT
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const privateRoute = require("../middelwares/privateRoute");

//Register Route
router.post("/register", async (req, res) => {
    const validation = userValidation(req.body);
    //data validation before creating user
    //if error returning error and not going further
    if (validation.error) {
        console.log(validation.error.details[0].message);
        return res.status(400).send(validation.error.details[0].message);
    }
    //
    //
    //verifying if the email already exists
    const emailExists = await User.findOne({
        email: req.body.email.toLowerCase(),
    });
    if (emailExists) return res.status(400).send("Email Already exists");
    //
    //
    //encrypting password
    const salt = await bcrypt.genSalt(10);
    const hashedPasswort = await bcrypt.hash(req.body.password, salt);
    //
    //creating new user
    const user = new User({
        name: req.body.name,
        email: req.body.email.toLowerCase(), //Making it lower case
        password: hashedPasswort,
        phoneNumber: req.body.phoneNumber,
    }); // saving the new user
    try {
        const savedUser = await user.save();
        res.send("USER_REGISTERED"); //don't send the entire user just send the id or the username
    } catch (err) {
        res.status(400).send(err);
    }
});
//Login Route
router.post("/login", async (req, res) => {
    //
    //
    //verifying if the user exists (login)
    const user = await User.findOne({
        email: req.body.email.toLowerCase(),
    });
    if (!user) return res.status(400).send("Email or Password Incorrect");
    //
    //
    //comparing passwords
    const passwordIsValid = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!passwordIsValid) {
        return res.status(400).send("Email or Password Incorrect");
    }
    //everything is good so log in
    //create a token and assign it
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN);
    res.status(200).send(token);
});
//Get Current User Route
router.get("/getUser", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);

    await User.findById(id)
        .select({ password: false })
        .then((data) => res.send(data))
        .catch((err) => console.log(err));
});

// Update User
router.post("/updateUser", privateRoute, async (req, res) => {
    const token = req.body.token;
    const newUser = req.body.newUser;
    const id = jwt.decode(token);
    const validation = updateValidation(req.body.newUser);
    const user = await User.findOne({
        _id: id,
    });
    if (
        user.name === newUser.newName &&
        user.email === newUser.newEmail &&
        user.phoneNumber === newUser.newPhoneNumber
    ) {
        return res.status(400).send("No changes made to submit");
    }

    //validate the new values
    if (validation.error) {
        return res.status(405).send(validation.error.details[0].message);
    }

    await User.findByIdAndUpdate(id._id, {
        name: newUser.newName,
        email: newUser.newEmail,
        phoneNumber: newUser.newPhoneNumber,
    })
        .then((data) => res.status(200).send("USERUPDATED"))
        .catch((err) => res.status(400).send(err));
});

//modify password
router.post("/updatePassword", privateRoute, async (req, res) => {
    const token = req.body.token;
    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    const passwordIsValid = await bcrypt.compare(
        req.body.oldPassword,
        user.password
    );
    if (!passwordIsValid) {
        return res.status(400).send("Wrong Password");
    }
    const passwordNotChanged = await bcrypt.compare(
        req.body.newPassword,
        user.password
    );
    if (passwordNotChanged) {
        return res.status(400).send("Password not changed : No change made");
    }
    let { newPassword } = req.body.newPassword;

    //validate the new values
    const validation = passwordValidation(newPassword);
    if (validation.error) {
        return res.status(405).send(validation.error.details[0].message);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    await User.findByIdAndUpdate(id._id, {
        password: hashedPassword,
    })
        .then((data) => res.status(200).send("PASSWORDUPDATED"))
        .catch((err) => res.status(400).send(err));
});

router.post("/addToCart", privateRoute, async (req, res) => {
    console.log(req.body);
    const token = req.headers.authorization;
    const newProduct = req.body.newProduct;
    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    const productAlreadyInCart = user.cart.find(
        (element) => element._id === newProduct._id
    );
    if (productAlreadyInCart) {
        return res.status(201).send("Product Already In Cart");
    }

    let x = [...user.cart, newProduct];

    await User.findByIdAndUpdate(id._id, { cart: x })
        .then((data) => res.send("Added To Cart"))
        .catch((err) => console.log(err));
});

router.post("/removeFromCart", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    let gameToRemove = req.body.gameToRemove;
    let x = user.cart;
    let y = x.filter((el) => el._id !== gameToRemove);

    await User.findByIdAndUpdate(id._id, { cart: y })
        .then((data) => res.send(data))
        .catch((err) => res.send(err));
});
router.post("/changeQuantity", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    let x = user.cart;
    const idOfGame = req.body.id;
    const operation = req.body.operation;

    x.forEach((game) => {
        if (game._id === idOfGame) {
            if (operation === "plus" && game.quantity < 5) {
                game.quantity++;
            }
            if (operation === "minus" && game.quantity > 1) {
                game.quantity--;
            }
        }
    });

    await User.findByIdAndUpdate(id._id, { cart: x })
        .then((data) => res.send(data.cart))
        .catch((err) => res.send(err));
});

router.post("/addToCartTopUp", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const newTopUp = req.body;

    const id = jwt.decode(token);
    const user = await User.findOne({
        _id: id,
    });
    const game = await TopUp.findOne({
        searchName: req.body.gameTopUp,
    });

    if (!newTopUp.amount || !newTopUp.price) {
        return res.status(208).send("Please Select Amount To TopUp");
    }
    if (
        !newTopUp.credentials.id &&
        (!newTopUp.credentials.accountType ||
            !newTopUp.credentials.login ||
            !newTopUp.credentials.password)
    ) {
        return res
            .status(208)
            .send("Please Fill the Credentials (id or Account)");
    }
    const productAlreadyInCart = user.cart.find(
        (element) => element._id === newTopUp._id
    );
    if (productAlreadyInCart) {
        return res
            .status(208)
            .send("Sorry, Only one Top-Up per Game is allowed");
    }

    const itemToAddToCart = {
        name: `${game.gameName} : ${newTopUp.amount} ${game.currency}`,
        img: game.img,
        region: game.region,
        currentPrice: newTopUp.price,
        quantity: 1,
        credentials: newTopUp.credentials,
        type: "TOPUP",
        currencyImg: game.currencyImg,
        _id: newTopUp._id,
    };
    let x = [...user.cart, itemToAddToCart];

    await User.findByIdAndUpdate(id._id, { cart: x })
        .then((data) => res.status(205).send("Added To Cart"))
        .catch((err) => console.log(err));
});
router.post("/clearCart", privateRoute, async (req, res) => {
    const token = req.headers.authorization;

    const id = jwt.decode(token);

    await User.findByIdAndUpdate(id._id, { cart: [] })
        .then((data) => res.status(205).send("cart Cleared"))
        .catch((err) => console.log(err));
});

router.post("/rateSeller", privateRoute, async (req, res) => {
    const token = req.headers.authorization;
    const id = jwt.decode(token);
    console.log(req.body);
    try {
        const user = await User.findOne({
            _id: id,
        });
        const seller = await User.updateOne(
            { _id: req.body.sellerId },
            {
                $push: {
                    rate: [{ note: req.body.note, msg: req.body.msg }],
                    notifications: [
                        {
                            msg: `You Have Been Rated by '${user.name}' : rate : ${req.body.note}/100. Comment : '${req.body.msg}' `,
                            read: false,
                            type: "rating",
                        },
                    ],
                },
            }
        );
        res.status(200).send("RatingDone");
    } catch (error) {
        res.status(400).send("Rating Eroor");
    }
});

module.exports = router;
