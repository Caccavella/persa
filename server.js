var express = require('express'),
    app = express(),
    http = require('http'),
    clientSessions = require('client-sessions')
    bodyParser = require('body-parser');
var serveStatic = require('serve-static');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceKey.json');
const config = require('./config');
// const MongoClient = require('mongodb').MongoClient;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://model-axe-273818.firebaseio.com"
});
const db = admin.firestore();


app.use(clientSessions({
  cookieName: config.cookieName,
  secret: config.sessionSecret,
  duration: 1000 * 60 * 60 * 24,
  activeDuration: 1000 * 60 * 20,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

app.use(function(req, res, next) {
  var allowedOrigins = ['https://www.personabilities.com', 'https://app.personabilities.com', 'https://personabilities.com', 'http://localhost:8080'];
  var origin = req.headers.origin;
  if(allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
  }
    next();  
})
// var router = express.Router;

app.use(serveStatic(__dirname + "/dist"));
app.use(bodyParser.json());

// MongoClient.connect(config.mongodb.uri, function(err, client) {
//   if(err) {
//     console.log('An error occurred connecting to Mongodb', err);
//     process.exit(1)
//   } else {
//     var db = client.db('v1')
    var algorithm = require('./routes/algorithms')(db);
    // var checkout = require('./routes/checkout')(db);
    var users = require('./routes/users')(db);
    
    app.use('/algorithm', algorithm);
    // app.use('/checkout', checkout);
    app.use('/users', users);
  // }
  http.createServer(app).listen(process.env.PORT || 5050);
  if(process.env.PORT) {
    console.log("listening on port " + process.env.PORT);
  } else {
    console.log("listening on port " +  5050);
  }
// })



module.exports = app;