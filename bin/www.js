const http = require('http');
const app = require('../app');
const config = require('../config');
const { colorLog } = require('../api/helpers/utils');
let defaultPort = 3000;

const server = http.createServer(app);
server.listen(config.port || defaultPort, () => {
	console.log(`Server started at ${colorLog(config.port || defaultPort, 36, 0, 7)}.`);
});