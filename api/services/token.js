const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../../config/index');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} [secret]
 * @returns {string}
 */


const generateToken = (userId, secret = config.token_secret) => {
	const payload = {
		sub: userId,
		iat: moment().unix(),
		// exp: moment().add(10, 'seconds').unix(),
	};
	return jwt.sign(payload, secret);
};



module.exports = {
	generateToken,
}
