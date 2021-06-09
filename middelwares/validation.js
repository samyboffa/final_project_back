const Joi = require("joi");
//validation registring using JOI
const userValidation = (req) => {
    const schema = Joi.object({
        name: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(8).max(255).email().required(),
        password: Joi.string().min(8).max(1024).required(),
        phoneNumber: Joi.string().min(6).required(),
    });
    return schema.validate(req);
};
const loginValidation = (req) => {
    const schema = Joi.object({
        email: Joi.string().min(8).max(255).email().required(),
        password: Joi.string().min(8).max(1024).required(),
    });
    return schema.validate(req);
};
const updateValidation = (req) => {
    const schema = Joi.object({
        newName: Joi.string().min(4).max(255).required(),
        newEmail: Joi.string().min(8).max(255).email().required(),
        newPhoneNumber: Joi.string().min(6).required(),
    });
    return schema.validate(req);
};
const passwordValidation = (req) => {
    const schema = Joi.object({
        newPassword: Joi.string().min(8).max(1024).required(),
    });
    return schema.validate(req);
};

module.exports.userValidation = userValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateValidation = updateValidation;
module.exports.passwordValidation = passwordValidation;
