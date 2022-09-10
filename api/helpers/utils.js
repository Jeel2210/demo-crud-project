const bcrypt = require('bcryptjs');
const { col, Op, where } = require('sequelize');
const moment = require('moment');
const crypto = require('crypto');
const uuid = require(`uuid`)


/**
 * @param {*} req 
 * @param  {any} texts - Datatype should strictly be string or object(which will be stringified)
 * @returns 
 */
const saveConsole = (req, ...texts) => {
	if (!req) return;

	let errorStack = new TypeError('Stack check');
	let lineNoOfLog = errorStack?.stack?.split('\n')?.filter(el => el?.includes('Object.<anonymous>'))?.join('')?.replace('Object.<anonymous>', '')?.trim();
	if (!lineNoOfLog) {
		lineNoOfLog = errorStack?.stack?.split('\n')?.filter((el, i) => i === 2)?.join('')?.replace('Object.<anonymous>', '')?.trim();
	}

	req.evaluation_console = req.evaluation_console || '';
	let log = req.evaluation_console;
	texts = texts.map(el => {
		let message = null;
		if (typeof el !== 'string') {
			try {
				message = el.stack || el.message || el;
			} catch (error) {
				message = el;
			}
		}

		if (`${message}` === '[object Object]') {
			message = JSON.stringify(message);
		}

		if (!message) {
			message = el || null
		}
		message = `\n\tMessage:\n\t\t${message}\n`;
		return message;
	})

	let combinedLog = [log, ...texts].join(`\n\t\t===--------------#--------------===\n`);

	combinedLog = `*\tLine: \n\t${lineNoOfLog || errorStack.stack}\n\t- - - - - - -\n\t${combinedLog}\n\t${colorLog('~ ~ ~ ~ ~ ~ ~', 33)}\n`;
	req.evaluation_console = combinedLog;
}




const colorLog = (text, color, bg, other) => `${color ? `\x1b[${color}m` : ''}${bg ? `\x1b[${bg}m` : ''}${other ? `\x1b[${other}m` : ''} ${text || 'No text provided'} \x1b[0m`;

/**
 * @param {Object} errObj 
 * @param {boolean} throwError 
 * @returns error message or throw the error
 */
const errorMessage = (errObj, throwError = false, req, log = false) => {
	if (log) console.log(errObj);
	const commonMessage = `Something went wrong!`;
	let message = errObj?.message || (typeof (errObj) === 'string' ? errObj : null) || commonMessage;
	let isSQLError = ['Truncated incorrect', `WHERE parameter`, `Cannot add or update a child row`, `You have an error in your SQL syntax`, `Unknown column`].some(el => message.includes(el));
	if (isSQLError) {
		console.log(colorLog(`THERE'S A SQL ERROR: `, 31, 47, 7), errObj);
		message = 'Something went wrong. Please try again!';
	}
	saveConsole(req, message);
	if (throwError) throw new TypeError(message);
	return (message);
};

const parse = el => JSON.parse(JSON.stringify(el));


const createPassword = pwd => {
	try {
		if (!pwd) throw new TypeError('Invalid string provided.');
		return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
	} catch (error) {
		errorMessage('Something went wrong.', true);
	}
};

const validatePassword = (dbPassword, checkPassword) => {
	try {
		return bcrypt.compareSync(checkPassword, dbPassword);
	} catch (error) {
		return false;
	}
};


/**
 * @param {Object} req
 * @param {boolean} req.noPagination
 * @param {Object} req.query
 * @param {string} req.query.page
 * @param {string} req.query.limit
 */
const pagination = req => {
	if (req.noPagination) return {};
	let query = req.query;
	query.page = parseInt(query.page || req.params.page || 1);
	query.limit = parseInt(query.limit || 10);
	if (!query.page || !query.limit) return {};
	return {
		limit: query.limit,
		offset: query.limit * (query.page - 1)
	}
};


/**
 * @param {Object} req 
 * @param {Object} req.query
 * @param {string} req.query.order
 * @param {string} req.query.orderby
 * @param {string} req.query.colPrefix
 * @param {Object} obj
 * @param {Object} obj.colOrders - Eg. {created_at: ['col', 'order'], name: ['col', 'order'], something_else: ['col', 'order']}
 * 	- Here **created_at** is req.query.orderby and value is order of that
 * @param {Array} obj.defaultOrder - Eg. [['col', 'order'], ['col2', 'order']]
 * @param {boolean} obj.defaultOptional - If there is even a single order array and this field is **true**. Then optional order array won't be added to returning array.
 */
const sequelize_order = (req, colPrefix = '', obj = {}) => {
	let order = req?.query?.order || 'desc';
	let orderArr = [];
	// If any manual order(colOrders) provided and requested in req.query.orderby,, then... they will be applied first(means.. first in array);
	if (obj?.colOrders?.[req.query?.orderby]?.length) orderArr = [...orderArr, obj.colOrders?.[req.query?.orderby]];
	// Default order if no manual order provided
	if (obj?.defaultOrder && (!orderArr.length && obj.defaultOptional)) orderArr = [...orderArr, ...obj.defaultOrder];
	// If no default provided then below default will be used instead
	if (!orderArr.length) orderArr = [...orderArr, [`${colPrefix ? `${colPrefix}.` : ''}${req?.query?.orderby || 'created_at'}`, order]];
	orderArr.map(el => el[0] = col(el[0]));
	return orderArr;
};


const calculateExpireOn = (days) => {
	var date = new Date(); // Now
	date.setDate(date.getDate() + days); // Set now + 30 days as the new date
	return date;
}

/**
 * @param {Array} searchAttr - Array of attribute to search from
 * @param {Object} req
 * @param {Object} req.query
 * @param {string} req.query.search
 */
const searchQuery = (searchAttr = [], req) => {
	let searchQuery = {};
	console.log(req.query);
	let _or = [];
	if (!req.query.search) return searchQuery;
	searchAttr.map(el => {
		let searchQuery = null;
		if (el.split('.').length > 1) {
			searchQuery = where(col(el), 'like', `%${req.query.search}%`)
		} else {
			searchQuery = {
				[el]: {
					[Op.like]: `%${req.query.search}%`
				}
			};
		}
		_or = [
			..._or,
			searchQuery
		];
	});
	searchQuery[Op.or] = _or;
	return searchQuery;
}

let password = "JFDSJWHVCVNSDHFDSFDL#4324332435412312421Sdjsakjfl@J@#@VCjdsfdsfjkdsjfksdjgsdgjfgfdkgjlsgschgwerfgirdo114";
const ENCRYPTION_KEY = crypto.scryptSync(password, 'salt', 32); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function cipher(text) {
	text = text.toString();
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decipher(text) {
	let textParts = text.split(':');
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}


/**
 * @param {string} time - Hours and seconds eg. 2:10
 * @returns UTC time.
 */
let timeToDate = (time, tz = true) => {
	if (!time) return null;
	time = time.split(':').map(el => el.length === 1 ? `0${el}` : el).join(':');
	if ((time?.length > 5) || !time) return time || null;
	let currentDate = moment().utc().format('YYYY-MM-DD');
	return tz ? `${currentDate}T${time}:00Z` : `${currentDate} ${time}:00`;
};



/**
 * @param {object} req - req obj
 * @param {boolean} getArray - If true returns queries in array. If false then returns in sequelize [Op.or] array eg. **{** *[Op.or]: [...queries]* **}**
 * @param {object} req.query
 * @param {object} req.query.from_date
 * @param {object} req.query.to_date
 * @param {boolean} req.query.samedayFilter
 * @param {string} attr - Date attribute to compare date with. By default **'created_at'** will be used.
 * @returns If getArray is **true** then *Array with date attributes or empty Array. Use them in [Op.or]* if **false** then *sequelize [Op.or] object or empty object*.
 * 	#### When getArray is true
 * 	[] **or** [created_at: {[Op.gt]...}...]
 * 	#### When getArray is false
 *  {} **or** {[Op.and]: [created_at: {[Op.gt]...}...]}
 */
let sequelizeDateFilter = (req, getArray, attr = 'created_at') => {
	let from_date = req.query.from_date ? moment(req.query.from_date.split(' ').join('+')).utc().format() : null;
	let to_date = req.query.to_date ? moment(req.query.to_date.split(' ').join('+')).utc().format() : null;

	if (from_date && to_date) {
		let dateDiff = moment(to_date).diff(moment(from_date), 'second');
		console.log({ from_date, to_date, dateDiff });
		if (dateDiff < 0) errorMessage('from_date should be the date before to_date.', true);
	}

	if (boolFlag(req.query.samedayFilter) && from_date) {
		to_date = moment(from_date).utc().add(1, 'days').set({ hour: 0, minute: 0, second: 0 }).format();
	}

	let arr = [
		...from_date ? [{
			[attr]: {
				[Op.gte]: from_date
			}
		}] : [],
		...to_date ? [{
			[attr]: {
				[Op.lte]: to_date
			}
		}] : []
	];
	return getArray ? arr : (arr.length ? { [Op.and]: arr } : {});
}

const rawSql = (...attr) => {
	return attr.join(' ').split('\t').join('  ');
};


const boolFlag = prop => !![true, 'true', 1, '1'].includes(prop);

/**
 * 
 * @param {*} time - Time string
 * @param {*} ignoreTZ - Boolean to remove timezone info from time
 * @returns 
 */
function manageTimeSpace(time, ignoreTZ = false) {
	if (!time) return time;
	let temp = time.trim().split(' ');
	if (temp.length === 2) {
		if (time.toUpperCase().split('T').length === 2) time = temp.join('+');
		else time = temp.join('T');
	}
	if (temp.length === 3) {
		time = `${temp[0]}T${temp[1]}+${temp[2]}`;
	}

	if (ignoreTZ) time = time.split('+')[0];
	return time;
}




/**
 * 
 * @param {*} time - Time string
 * @param {*} ignoreTZ - Boolean to remove timezone info from time
 * @returns 
 */
function date_difference(date1, date2) {
	date1 = moment().format(date1, `DD/MM/YYYY`);
	date2 = moment().format(date2, `DD/MM/YYYY`);

	date1 = new Date(date1);
	date2 = new Date(date2);

	const diffInMs = Math.abs(date2 - date1);
	return diffInMs / (1000 * 60 * 60 * 24);
}


const generateUuid = () => {
	return uuid.v4();
}

module.exports = {
	errorMessage,
	parse,
	colorLog,
	createPassword,
	validatePassword,
	pagination,
	sequelize_order,
	decipher,
	cipher,
	searchQuery,
	timeToDate,
	calculateExpireOn,
	sequelizeDateFilter,
	rawSql,
	boolFlag,
	saveConsole,
	manageTimeSpace,
	date_difference,
	generateUuid
};
