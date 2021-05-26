const mongoose = require("mongoose");

const connectDB = () => {
    mongoose
        .connect(process.env.DB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        .then(() => console.log("connection to database succesfull"))
        .catch((err) => console.log("connection to database error"));
};
module.exports = connectDB;
