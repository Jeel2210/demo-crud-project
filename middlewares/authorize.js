//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY2MjgzMDYzNH0.WWbO4Ad1eJ7-kQ_qas3wtTb1t9qDStx4reTew6pu3bE
const resPattern = require("../api/helpers/responsePattern");
const jwt = require('express-jwt');
const httpStatus = require("http-status");
const { errorMessage, parse } = require("../api/helpers/utils");
const config = require("../config");
const models = require("../api/models");
const { isEmpty } = require("lodash");
const ApiError = require("../api/utils/ApiError");


/**
 * @param {*} userTypes #### Valid values are
 * 		- [ 'SUPER_ADMIN', 'PARTNER', 'TRAINER', 'USER' ]
 * @param {*} credentialsRequired #### Scenario to set as false
 * 		- If some api don't need jwt in all cases
 * 		- If just need jwt token data for process but authentication is not required
 */
const authorize = (userTypes, credentialsRequired = true, _tokenFor) => {
	try {
		return [
			jwt({ secret: config.token_secret, algorithms: ['HS256'], credentialsRequired }),
			async (req, res, next) => {
				req.user;
				console.log('User Loggedin', req.get('Authorization').split('Bearer ')[1]);
				try {
					let tokenUser = await models.users.findOne({
						where: {
							id: req.user.sub,
							device_token: req.get('Authorization').split('Bearer ')[1]
						},
						attributes: {
							exclude: ['password']
						}
					});
					tokenUser = parse(tokenUser);
					req.userinfo = tokenUser;
					if (!tokenUser) throw new ApiError(400, 'Unauthorized');
					else next();
				} catch (error) {
					console.log(error);
					return next(new resPattern.failedResponse(errorMessage(error)));
				}
			}
		]
	} catch (error) {
		console.log("Err", error);
	}
};


module.exports = authorize;