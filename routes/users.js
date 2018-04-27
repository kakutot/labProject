var express = require('express');
var router = express.Router();
var User = require('../model/user');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
router.use(expressValidator());
/* GET blog page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Tupkalenko Lab>blog' });
});
/* GET yachts page. */
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Tupkalenko Lab>yachts' });
});

router.post('/register', function(req, res,err){
   var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var admin = (username=='admin' && password =='123');

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    }
    else {

    User.getUserByUsername(username,function(err, user){
        console.log(user);
        if(user){
            req.flash('error_msg', 'User exists');
            res.redirect('register');
        }
        else {

            var newUser = new User({
                name: name,
                email:email,
                username: username,
                password: password,
                admin:admin
            });

            User.createUser(newUser, function(err, user){
                if(err) throw err;
                console.log(user);
            });

            req.flash('success_msg', 'You are registered and can now login');

            res.redirect('/users/login');
        }
        });

    }
});

router.post('/register', passport.authenticate('register', {
    successRedirect: '/index',
    failureRedirect: '/register',
    failureFlash : false
}));


passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
router.post('/login',
    passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });
router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});
module.exports = router;
