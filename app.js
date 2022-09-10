global.__basedir = __dirname;
const app = require('express')();
const bodyParser = require('body-parser');
const routes = require('./routes');
const logger = require('morgan');
const cors = require("cors");
const { errorConverter, errorHandler } = require('./middlewares/error');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));

app.use(logger(':method :url :status :res[content-length] - :response-time ms'));
app.use(cors());


app.use('/api', routes);


app.use(function (req, res, next) {
	next({ status: 404, message: 'Api not found' });
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;

