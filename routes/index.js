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
    var connection= mysql.createConnection({
        user: 'root',
        password: '21272829ab',
        host: '127.0.0.1',
        database: 'web_db'
    });
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });
    sql = "SELECT Yacht_Name,Descr FROM yacht ";
      connection.query(sql, function(err,result,fields) {
         if (err) {
             console.error('error: ' + err.stack);
             return;
         }

         var resObject = [];
       for(var i =2 ;i<result.length;i++){
            resObject.push({Yacht_Name:result[i].Yacht_Name,Descr:result[i].Descr});
             console.log(resObject[i]);
       }
        console.log(resObject.length);
          res.render('yachts', {resObject:resObject});
    });
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
