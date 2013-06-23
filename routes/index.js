var db = require('mongoskin').db('localhost:27017/beers');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
