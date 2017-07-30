// Dani Woo Hyun Kim
// Reel Talk

var https = require('https');
var fs = require('fs') // filesystem module
var express = require('express'); // npm install express
var app = express();
var session = require('express-session');
var nodemailer = require('nodemailer'); // npm install nodemailer

// photo uploads
var multer = require('multer');
var upload = multer({
		dest: 'uploads/'
});

// mongoDB
var MongoStore = require('connect-mongo')(session);
var mongojs = require('mongojs'); // npm install mongojs
var mongoData = mongojs('networkedmedia:networkedmedia@ds113580.mlab.com:13580/networkedmedia', ['articles','logins', 'sessions']); // can i change collections?

// credentials
// no SSL certificate yet
// uncomment below if my-key.pen and my-cert.pem files are included
// var credentials = {
//     key: fs.readFileSync('my-key.pem'),
//     cert: fs.readFileSync('my-cert.pem')
// };

var bcrypt = require('bcrypt-nodejs'); // npm install bcrypt-nodejs
const uuidV1 = require('uuid/v1') // npm install node-uuid

// for parsing data from forms
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ 
		extended: true 
});
app.use(urlencodedParser);

app.set('view engine', 'ejs'); // npm install ejs

app.use(session({
	secret: 'secret',
	cookie: {
		maxAge: 365 * 24 * 60 * 60 * 1000
	},
	store: new MongoStore({
		url: 'mongodb://networkedmedia:networkedmedia@ds113580.mlab.com:13580/networkedmedia'
	})
}));

app.use(function(req, res, next) {
	res.locals.user = req.session;
	next();
});

function generateHash(password) {
	return bcrypt.hashSync(password);
};

function compareHash(password, hash) {
	return bcrypt.compareSync(password, hash);
};

app.get('/login', function(req, res) {
	if (!req.session.username) {
		res.render('login.ejs', {}); // if the user needs to login, render to login.ejs
	} else {
		res.render('main.ejs', req.session); 
		// if the user already has session data, render to main.ejs
		// don't have a main.ejs page
}
});

app.get('/', function(req, res) {
	mongoData.articles.find({}, function(err, saved) {
		if (err || !saved) {
			console.log('No results!');
		} else {
			var articlesFromDatabase = {
				'articlesArray': saved
			};
			res.render('index.ejs', articlesFromDatabase);
		}
	});
});

app.get('/newReleases', function(req, res) {
	var query = "new";
	mongoData.articles.find({"category": query}, 
	
	function(err, saved) {
		if( err || !saved) {
				console.log("No articles in New Releases Category!");
		} else {
			// res.send(saved);
			var articlesFromDatabase = {
				'articlesArray': saved
			};
			res.render('newReleases.ejs', articlesFromDatabase);
		}
	});
});

app.get('/moreLists', function(req, res) {
	var query = "list";
	mongoData.articles.find({"category": query}, 
	
	function(err, saved) {
		if( err || !saved) {
			console.log("No articles in More Lists Please Category!");
		} else {
			// res.send(saved);
			var articlesFromDatabase = {
				'articlesArray': saved
			};
			res.render('moreLists.ejs', articlesFromDatabase);
	}
	});
});

app.get('/crowdPleasers', function(req, res) {
	var query = "crowd";
	mongoData.articles.find({"category": query}, 
	
	function(err, saved) {
		if( err || !saved) {
			console.log("No articles in More Lists Please Category!");
		} else {
			// res.send(saved);
			var articlesFromDatabase = {
				'articlesArray': saved
			};
			res.render('crowdPleasers.ejs', articlesFromDatabase);
		}
	});
});

app.get('/ourFaves', function(req, res) {
	var query = "fave";
	mongoData.articles.find({"category": query}, 
	
	function(err, saved) {
		if( err || !saved) {
			console.log("No articles in More Lists Please Category!");
		} else {
			// res.send(saved);
			var articlesFromDatabase = {
				'articlesArray': saved
			};
			res.render('ourFaves.ejs', articlesFromDatabase);
		}
	});
});

app.get('/getPost', function(req, res) {
	var o_id = new mongojs.ObjectID(req.query.postid); // mongoDB data is an object so put that object into an array
	mongoData.articles.find({"_id":o_id}, function(err, document) { // call for the object that matches the post id
		var singlePage = {
			'singleArticleArray': document // ejs could not recognize document so had to put into a variable
		};
		res.render('single.ejs', singlePage)
	});
});

app.get('/search', function(req, res) {
	var query = new RegExp(req.query.q);
	console.log(req.query);
	mongoData.articles.find({
		// "title": query,
		// "name": query,
		"article": query,
	}, 
	function(err, saved) {
		if( err || !saved) {
			console.log("No results!");
		} else {
			var articlesFromDatabase = {
				'articlesArray': saved,
				'query': req.query.q
			};
			res.render('search.ejs', articlesFromDatabase);
		}
	});
});

app.get('/registration', function(req, res) {
	res.render('registration.ejs', {}); // if the user needs to register an account, render to registration.ejs
});

app.post('/register', function(req, res) {
	console.log(req.body);
	req.body.password = generateHash(req.body.password);

	mongoData.logins.save(req.body, function(err, saved) {
		if (err || !saved) { 
			console.log('Registration not saved!');
			res.send('Incorrect');
	} else { 
			console.log('Registration saved!');
			res.send('Correct');
		}
	});
	// res.redirect('/');
});

app.post('/login', function(req, res) {
	mongoData.logins.findOne({
		'username': req.body.username
	},
	function(err, doc) {
		if (doc != null) {
			if (compareHash(req.body.password, doc.password)) {
				req.session.username = doc.username;
				req.session.lastlogin = Date.now();
				res.send('Correct');
			} else {
				res.send('Incorrect');
			}
		} else {
			res.send('Incorrect');
		}
	});
});

app.get('/logout', function(req, res) {
		delete req.session.username;
		res.redirect('/');
});

app.post('/submit', upload.single('photo'), function(req, res) {
	console.log(req.file.filename);
	req.body.photo = req.file.filename;
	mongoData.articles.save(req.body, function(err, saved) {
		if (err || !saved) {
			console.log('Article submission not saved!');
			// res.rend('Thanks!');
		} else {
			console.log('Article submission saved');
		}
	});
	// res.send('Thank you for your submission!');
	res.redirect('/thanks')
});

app.get('/thanks', function(req, res) {
	res.render('thanks.ejs');
});

app.get('/contact', function(req, res) {
	res.render('contact.ejs');
});

app.get('/about', function(req, res) {
	res.render('about.ejs');
});

app.get('/submit', function(req, res) {
	res.render('submit.ejs');
});

app.get('/thanks', function(req, res) {
	res.render('thanks.ejs');
});

app.post('/email', function(req, res) {
	var mailOptions = {
		to: 'daniwhkim@gmail.com',
		subject: 'New Message From Reel Talk',
		text: "New message from " + req.body.name + "\n" + "Reply at " + req.body.email + "\n" + req.body.text,
	}

	var smtpTransport = nodemailer.createTransport( {
		service: "gmail",
		host: "smtp.gmail.com",
		auth: {
			user: 'your Gmail address here',
			pass: 'your Gmail password here'
		}
	});
	
	smtpTransport.sendMail(mailOptions, function(error, response) {
		if (error) {
			res.send('Nope');
			console.log("Message not sent!");
			// console.log(error);
			// res.end("Error in sending email.");
		} else {
			res.send('Sent');
			console.log("Message sent! Check email!");
			// console.log(response);
			// res.end("Email sent.");
		}
	});
});

app.use(express.static('public'));
app.use(express.static('uploads'));

// not using SSL certificate with HTTP
app.listen(3000, function() {
	console.log('I am listening on port 3001! Not HTTPS');
});

// once SSL certificate obtained, used HTTPS below
// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443, function() {
//     console.log('I am listening on port 443! On the server!');
// });