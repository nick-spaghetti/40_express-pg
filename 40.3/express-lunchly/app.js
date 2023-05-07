/** Express app for Lunchly. */
const express = require('express');
const nunjucks = require("nunjucks");
const morgan = require('morgan');
const expressError = require('./express-error');
const bodyParser = require('body-parser');
const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

nunjucks.configure("templates", {
	autoescape: true,
	express: app
});

const routes = require("./routes");
app.use(routes);

/** 404 handler */

app.use((req, res, next) => {
	const e = new expressError('page not found', 404);
	next(e);
});

/** general error handler */

app.use((err, req, res, next) => {
	res.status(err.status || 500);

	return res.render("error.html", {
		err
	});
});

module.exports = app;