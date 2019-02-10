const express=require('express');
const bodyParser = require('body-parser');
const app=express();
const route=require('./routes/employee');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/api',route);
const port=5001;
app.listen(port);
console.log('Listening on port '+port);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var error=new Error("could not find "+req.path);
  error.code=404;
  next(error);
});

//Handle all the errors from API
app.use(function(err, req, res, next) {
  res.send({
    message:err.message,
    code:err.code
})
});

module.exports=app;


