var express = require('express');
var router = express.Router();

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
    res.render('reservations', { title: 'Tupkalenko Lab>reservations' });
});
module.exports = router;
