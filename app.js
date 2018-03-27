var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars')
var routes = require('./routes/index');
var app = express();
var mysql = require('mysql');




// view engine setup
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views'}
   ))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
var connection= mysql.createConnection({
    user: 'root',
    password: '21272829ab',
    host: '127.0.0.1',
    database: 'web_db'
});

app.post("/reservations", function(req, res) {
    var fName = req.body.userFName;
    var lname =  req.body.userLName;
    var res_date = req.body.res_date;
    var yacht = req.body.yacht;

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });

    var post = {
        Fname: fName,
        Lname: lname
    };
    var sql = "INSERT INTO myuser SET ? ";

    connection.query(sql,post ,function (err, result) {
        if (err) throw err;
         console.log("user record inserted");
         console.log("user id " + result.insertId);

         //check duplicates values
         var sql2="SELECT * FROM myorder WHERE order_date='"+res_date +"' AND yacht_id ="+ yacht;
         console.log(sql2)
         connection.query(sql2, function(err,result) {
             console.log("length" + result.length)
             if (result.length > 0) {
                 res.render('nosuccess',{data:req.body})
                 connection.end();
             }
             else{

                 var val = {
                     yacht_id: yacht,
                     order_date:res_date,
                     user_id: result.insertId
                 };
                 connection.query("INSERT INTO myorder SET ?", val,
                     function(err, result) {
                         if (err) throw err;
                         console.log("second record inserted");
                         if(result.affectedRows>0){
                             console.log("rows aff" + result.affectedRows)
                             res.render('success',{data:req.body})
                         }
                         connection.end();
                     });
             }
         });
    });

});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

