var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars')

var app = express();
var mysql = require('mysql');

var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/weblabdb');
var db = mongoose.connection;

var routes = require('./routes/index');
var users =  require('./routes/users');




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

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());



//Connect Flash

app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);

var connection= mysql.createConnection({
    user: 'root',
    password: '21272829ab',
    host: '127.0.0.1',
    database: 'web_db'
});



app.post("/reservations", function(req, res) {
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });


        //нужно проверить есть ли вообще есть ли такая яхта

        var sql2 = "SELECT * FROM yacht WHERE Yacht_Name='" + req.body.yacht+"';";
        console.log(sql2)
        connection.query(sql2, function(err,result) {
            if (err) throw err;
            if(result.length>0){
                //check duplicates values

                var sql3 = "SELECT yacht_id FROM yacht WHERE Yacht_Name='" + req.body.yacht +"';";
                connection.query(sql3, function(err,result) {
                    console.log("Yacht id with such name : " + result[0].yacht_id);
                    if (err) throw err;
                    var sql4="SELECT * FROM myorder WHERE order_date ='" + req.body.res_date+"' AND yacht_id ="+result[0].yacht_id+";";
                    console.log(sql4);
                    var val = {
                        yacht_id: result[0].yacht_id,
                        order_date:req.body.res_date,
                        user_id: null
                    };
                    connection.query(sql4, function(err,result) {
                        if (result.length > 0) {
                            res.render('nosuccess',{data:req.body})
                            //connection.end();
                        }
                        else{
                            var post = {
                                Fname: req.body.userFName,
                                Lname: req.body.userLName
                            };
                            var sql = "INSERT INTO myuser SET ? ";
                            connection.query(sql,post ,function (err, result) {
                                if (err) throw err;

                                console.log("user record inserted");
                                console.log("user id " + result.insertId);
                                val.user_id = result.insertId;

                                connection.query("INSERT INTO myorder SET ?", val,
                                    function(err, result) {
                                        if (err) throw err;
                                        console.log("second record inserted");
                                        if(result.affectedRows>0){
                                            console.log("rows aff" + result.affectedRows)
                                            res.render('success',{data:req.body})
                                        }
                                      //  connection.end();
                                    });
                            });

                        }
                    });

                });
            }
            else{
                req.flash('error_msg', 'No such yacht!');
                res.redirect('/reservations');
            }
        });

});
app.post("/reservations/del", function(req, res) {
    // connection.connect(function(err) {
    //     if (err) {
    //         console.error('error connecting: ' + err.stack);
    //         return;
    //     }
    //     console.log('connected as id ' + connection.threadId);
        if(req.body.yachtName2=="Mako" || req.body.yachtName2=="Quiet Time" ){
            req.flash('error_msg', 'This yacht can not be deleted!');
            res.redirect('/yachts');
        }
        else{
            var sql = "SELECT Yacht_Name FROM yacht WHERE Yacht_Name ='" + req.body.yachtName2 + "'";
            connection.query(sql,function (err, result) {
                if (err) {
                    console.error('error: ' + err.stack);
                    return;
                }
                if(result.length>0){
                    var sql2 = "DELETE FROM yacht WHERE Yacht_Name ='" + req.body.yachtName2 + "'";
                    console.log("sql:"+sql2);
                    connection.query(sql2,function (err, result) {
                        if (err) {
                            console.error('error: ' + err.stack);
                            return;
                        }
                        req.flash('success_msg', 'Yacht deleted!');
                        res.redirect('/yachts');

                    });
                }
                else{
                    req.flash('error_msg', 'No such yacht!');
                    res.redirect('/reservations');
                }
            });
        }


});
app.post("/reservations/add", function(req, res) {
    // connection.connect(function(err) {
    //     if (err) {
    //         console.error('error connecting: ' + err.stack);
    //         return;
    //     }
    //     console.log('connected as id ' + connection.threadId);
    // });
    var sqlQuery = {
        Yacht_Name: req.body.yachtName,
        Descr : req.body.descr
    };
    var sql = "INSERT INTO yacht SET ? ";
    connection.query(sql,sqlQuery ,function (err, result) {
        if (err) {
            console.error('error: ' + err.stack);
            return;
        }
        req.flash('success_msg', 'Yacht added !');
        res.redirect('/yachts');

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

