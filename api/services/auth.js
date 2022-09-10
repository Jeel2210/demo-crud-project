const httpStatus = require('http-status');
const { parse, validatePassword } = require("../helpers/utils");
const userService = require("./user");
const ApiError = require('../utils/ApiError');
const models = require('../models');

/**
 
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (req, email, password) => {
	let user = await userService.getUserByEmail(req, email);
	user = parse(user);

	if (!user || !(validatePassword(user.password, password))) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
	}
	return user;
};

const updateUser = async (userId, token) => {
	await models.users.update({ device_token: token }, {
		where: { id: userId },
	});
	return;

}


module.exports = {
	loginUserWithEmailAndPassword,
	updateUser
}