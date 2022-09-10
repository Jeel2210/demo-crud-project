require('dotenv').config();
const { colorLog } = require('../api/helpers/utils');

const env = process.env;
const envArr = [env.environment, env.env, env.ENV, env.NODE_ENV];
const prod = colorLog('PRODUCTION', 31, 47, 7);
const dev = colorLog('DEVELOPMENT', 37, 0, 7);
const cmd = txt => colorLog(txt, 33, 0, 7);


let config = {
	/* OTHER */
	env: env.environment || env.env || env.ENV || env.NODE_ENV,
	sql_logging: !!parseInt(env.COMMON_SQL_LOGGING),
	timezone: 'Europe/Berlin',

	/* DB */
	port: 3000,
	db: '',
	db_pass: '',
	db_user: '',
	db_host: '',
	
	/* TOKEN */
	token_secret: 'SecretData',

	/* URLS */
	web_host_url_prefix: '',
	web_host_admin_url_prefix: '',

	/* DEBUG */
	debug_secret: null,
	debug_mode: true,

	
	/* FLAGS */
	get is_development() { return !['prod', 'production'].includes(this.env) }
};


if (['prod', 'production'].includes(config.env)) {
	config.env = 'production';
	config.port = env.PROD_PORT;
	config.db = env.PROD_DB;
	config.db_pass = env.PROD_DB_PASS;
	config.db_user = env.PROD_DB_USER;
	config.db_host = env.PROD_DB_HOST;
	config.token_secret = env.PROD_TOKEN_SECRET;
	config.aws_access_key_id = env.PROD_AWS_ACCESS_KEY_ID;
	config.aws_secret_access_key = env.PROD_AWS_SECRET_ACCESS_KEY;
	config.aws_bucket_name= env.PROD_AWS_BUCKET_NAME;
	config.aws_url_prefix=env.PROD_AWS_URL_PREFIX;
	console.log(`Server has started as ${prod}. To start as ${dev} run command ${cmd('env=dev npm start')}.`)
} else {
	config.env = 'development';
	config.port = env.DEV_PORT;
	config.db = env.DEV_DB;
	config.db_pass = env.DEV_DB_PASS;
	config.db_user = env.DEV_DB_USER;
	config.db_host = env.DEV_DB_HOST;
	config.token_secret = env.DEV_TOKEN_SECRET;
	config.aws_access_key_id = env.DEV_AWS_ACCESS_KEY_ID;
	config.aws_secret_access_key = env.DEV_AWS_SECRET_ACCESS_KEY;
	config.aws_bucket_name = env.DEV_AWS_BUCKET_NAME;
	config.aws_url_prefix = env.DEV_AWS_URL_PREFIX;
	console.log(`Server has started as ${dev}. To start as ${prod} run command ${cmd('env=prod npm start')}.`)
}


module.exports = config;