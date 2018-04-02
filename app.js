/* Module includes*/
var express      = require('express');
var bodyParser   = require('body-parser');
var path         = require('path');
var url          = require('url');
var collection   = require('./mongo');
var passwordList = require('./password.json');
var app          = express();
var http         = require( 'http' );
var https        = require( 'https' );
var fs           = require( 'fs' );

/* Constants */
const PORT    = process.env.PORT || 443;
const ROOT    = __dirname + '/public/';
const USER    = "user";
const COUNTER = "counter";
const LOG     = "log";

/* Read pem */
var options = {
  key: fs.readFileSync( './privkey.pem' ),
  cert: fs.readFileSync( './cert.pem' )
};

/* Middle Ware */
app.use(bodyParser());
app.use(express.static(ROOT));

/* Routes */

//  Check Database if given userId and 
//  password exists. Respond 200 if pass 
//  -word exists, 401 if none, 400 in err
app.post('/login', function(req, res) {
    var data = req.body; 
    
    // Organize data according to
    // password type.
    if(data.passwordType === 1) {
        data.password_1 = data.password;
    }
    else if(data.passwordType === 2) {
        data.password_2 = data.password;
    }
    else if(data.passwordType === 3) {
        data.password_3 = data.password;
    }

    // remove data not requried
    delete data.password; 
    delete data.passwordType;

    collection(USER, (db)=>{
        db.findOne(data, (err, dbRes)=>{
            if(err) {
                res.sendStatus(400);
            }
            else if (dbRes === null) {
                res.sendStatus(401);
            }
            else {
                res.sendStatus(200);
            }
        });
    });
});

// Inserts recieved log from client
// to database
app.post('/log', function(req, res) {
    var data = req.body;

    collection(LOG, (db)=>{
        db.insert(data, ()=>{
            res.sendStatus(200);        
        });
    });
});

// Response every log in databaase
app.get('/log', function(req, res) {
    collection(LOG, (db)=>{
        db.find({}).toArray((err, data)=>{
            res.send(JSON.stringify(data));        
        });
    });
});

// generates userId and 3 password, 
// inserts it to database and then 
// response back to client
app.get('/register', function(req, res) {
    var userData;
    
    // Passwords are selected randomly from password list 
    var password_1 = capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]); 
    var password_2 = capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]); 
    var password_3 = capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]) + 
                     capitalize(passwordList.password[randomIndex()]); 

    getNextId((id)=>{
        userData = new User(id, password_1, password_2, password_3);
        collection(USER, (db)=>{
            db.insert(userData, ()=>{
                res.send(JSON.stringify(userData));
            });
        });
    });
});

/* functions */

/**
 * User Object
 *
 * @param number userId 
 * @param string password_1 
 * @param string password_2
 * @param string password_3
 */
function User(userId, password_1, password_2, password_3) {
    this.userId     = userId;
    this.password_1 = password_1;
    this.password_2 = password_2;
    this.password_3 = password_3;
};

/**
 * Returns randomIndex
 * based on length of passwordlist
 *
 * @return number
 */
function randomIndex() {
    return Math.floor((Math.random() * (passwordList.password.length - 1)));
};

/**
 * Capitalizes first letter
 * in string
 *
 * @param string string
 * @return string
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Initializes counter in database
 * for generating auto-incremented userId
 *
 * @param function callback
 */
function initCounter(callback) {
    var counter = {_id: "userId", seq:0};

    collection(COUNTER, (db)=>{
        db.count((err, count)=>{
            // create counter if none exists
            // else do nothing
            if(! err && count === 0) {
                db.insert(counter);
            }
            callback();
        });
    });
};

/**
 * Gets next userId from db,
 * returns to callback
 *
 * @param function callback
 */
function getNextId(callback) {
    var query_1 = {_id: "userId"};
    var id;
    collection(COUNTER, (db)=>{
        db.findOne(query_1, (err, res)=>{
            id = res.seq;
            db.updateOne({_id: "userId"},{$inc: {seq: 1}}, (err, res)=>{
                callback(id);
            });
        });
    }); 
}

/**
 * Initializes counter, 
 * outputs running port
 */
function start() {
    initCounter(()=>{
        console.log('Server running on port: ' + PORT);
    });
};

/* Start server */

//app.listen(PORT, start); // use this for http

// Creates server, listen to port
var server = https.createServer(options, app).listen(PORT, function(){
    start();
});
