const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user');
const resPattern = require('../helpers/responsePattern');

const createUser = catchAsync(async (req, res) => {
	const user = await userService.createUser(req, req.body);
	let data = new resPattern.successResponse(user);
	res.status(data.status).json(data);
});

const all = catchAsync(async (req, res) => {
	console.log(req.user)
	let user = await userService.getUserById(req.user.sub);
	delete user.password
	let data = new resPattern.successResponse(user);
	res.status(data.status).json(data);
});


module.exports = {
	createUser,
	all
};
