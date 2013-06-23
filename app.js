
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
  , s3 = require('s3')
  , db = require('mongoskin').db('localhost:27017/beers')
  ,  _ = require('underscore')

var app = express();

conf.argv().env().file({file:'secrets.json'});

s3 = s3.createClient({
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
app.use(express.bodyParser({uploadDir:__dirname + '/tmp'}));
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
app.get('/search', function(req, res) {
   res.render('search')
})
app.post('/search', function(req,res) {
    console.log('/beer/' + req.body.beerQuery)
    res.redirect('/beer/' + req.body.beerQuery)
})

app.get('/beer/:beerName',function (req, res) {
    db.collection('beers').find().toArray( function (err, beers) {
        var beerList = _(beers).filter( function(beer) {
            return beer.drink_name.toLowerCase() === req.params.beerName.toLowerCase()
        })
        console.log(beerList)
        res.render('list', {
            beers: beerList
        })
    })
})

app.post('/add', function(req,res){
    var fileName = path.basename(req.files.img.path);
	console.log(fileName);
	var uploader = s3.upload(req.files.img.path, fileName, {
        'Content-Type' : req.files.img.type
    });
	uploader.on('end', function(url) {
		req.body['url'] = url;
		db.collection('beers').insert( req.body , function(err) {
			if(err) console.log(err);

			res.end();
		});
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
