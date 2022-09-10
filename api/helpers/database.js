const httpStatus = require("http-status");
const models = require("../models");
const ApiError = require("../utils/ApiError");
const { parse } = require("./utils");


const findModel = async (req, model, where, attributes = {}, include = []) => {
    let condition = { ...where ? where : { id: req.query.id } };
    let data = await model.findOne({
        ...attributes.length ? { attributes } : {},
        where: condition,
        ...include.length ? [include] : [],
    });
    return parse(data);
}

const findAndCountAllModel = async (req, model, where, attributes = {}, include = []) => {
    let condition = { ...where ? where : { id: req.query.id } };
    let data = await model.findAndCountAll({
        ...attributes.length ? { attributes } : {},
        where: condition,
        ...include.length ? [include] : [],
    });
    return parse(data);
}


const update = async (req, model, body, where) => {
    let condition = { ...where ? where : { id: req.query.id } };
    const updatedData = await model.update(body, {
        where: condition,
        transaction: req.tx
    });
    return parse(updatedData);
}


// const isExist = (req,models,where) => {
//     let err;
//     let data = await findModel(req, models.topic_wise_questions, where);
//     if (!data) err = `This ${models} does not exists! Kindly check once.`;
//     return;
// }

module.exports = {
    findModel,
    findAndCountAllModel,
    update,
    // isExist
}