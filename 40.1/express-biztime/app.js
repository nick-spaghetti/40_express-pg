/** BizTime express application. */
const express = require('express');
const morgan = require('morgan');
const ExpressError = require('./express-error');
const bodyParser = require('body-parser');
const axios = require('axios');
const compRoutes = require('./routes/companies')
const invRoutes = require('./routes/invoices')
const app = express();


app.use(morgan('dev'));

app.use(express.json());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use('/companies', compRoutes);
app.use('/invoices', invRoutes);


/** 404 handler */

app.use((req, res, next) => {
  const e = new ExpressError('page not found', 404);
  next(e);
});

/** general error handler */

app.use((e, req, res, next) => {
  let status = e.status || 500;
  let msg = e.msg || e;
  res.status(status).json({
    error: {
      msg,
      status
    }
  });
});

module.exports = app;