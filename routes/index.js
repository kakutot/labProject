var express = require('express');
var router = express.Router();
var mysql = require('mysql');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tupkalenko Lab' });
});
/* GET blog page. */
router.get('/blog', function(req, res, next) {
    res.render('blog', { title: 'Tupkalenko Lab>blog' });
});
/* GET yachts page. */
router.get('/yachts', function(req, res, next) {
    res.render('yachts', { title: 'Tupkalenko Lab>yachts' });
});
/* GET reservations page. */
router.get('/reservations', function(req, res, next) {
    var connection= mysql.createConnection({
        user: 'root',
        password: '21272829ab',
        host: '127.0.0.1',
        database: 'web_db'
    });
    var sql = "SELECT * FROM yacht";
    connection.query(sql ,function (err, result) {
        if (err) throw err;
        var yachtsN = result.length
        console.log(yachtsN)
        connection.end()
        res.render('reservations', {data:yachtsN})
    });

});


module.exports = router;
