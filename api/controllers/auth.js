const catchAsync = require('../utils/catchAsync');
const authService = require(`../services/auth`)
const tokenService = require(`../services/token`);
const resPattern = require(`../helpers/responsePattern`)

const login = catchAsync(async (req, res) => {
	const { mail, password } = req.body;

	let email = mail;
	let user = await authService.loginUserWithEmailAndPassword(req, email, password);
	const tokens = await tokenService.generateToken(user.id);
	await authService.updateUser(user.id, tokens)
	let data = new resPattern.successResponse({ user, tokens }, 'Success')
	res.status(data.status).json(data);

});


module.exports = {
	login,
};
