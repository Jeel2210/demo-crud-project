const { createPassword } = require("../helpers/utils");
const model = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
	return model.users.findOne({where: {id: id}});
};

/**
 * Create a user
 * @param {Object} body
 * @returns {Promise<User>}
 */
const createUser = async (req, body) => {
	body.password = createPassword(body.password);
	const user = await model.users.create(body, { transaction: req.tx });
	return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (req, email) => {
	return await model.users.findOne({
		where: {
			email: email,
		},
		transaction: req.tx
	});
};

const isPasswordMatch = async (req, user, password) => {
	return await model.users.findOne({
		where: {
			id: user.id,
			password: password,
		},
		transaction: req.tx
	});
};

module.exports = {
	getUserById,
	getUserByEmail,
	isPasswordMatch,
	createUser
};
