
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , add = require('./routes/add')
  , http = require('http')
  , path = require('path')
  , conf = require('nconf')
  , knox = require('knox');

var app = express();

conf.argv().env().file({file:'secrets.json'});

knox = knox.createClient({
	key: conf.get('s3_key'),
	secret: conf.get('s3_secret'),
	bucket: conf.get('s3_bucket')
});

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
app.get('/testForm', function(req,res) {
    res.render('testForm')
})

app.get('/users', user.list);
app.get('/add',add.add_your_drink);
app.post('/add', function(req,res){
    console.log(req.files)
	var fileName = path.basename(req.files.image.path);
	knox.putFile(fileName, req.files.image.path, function (err, res) {
		if (err)
			console.log(err);
		res.end()
	});
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
