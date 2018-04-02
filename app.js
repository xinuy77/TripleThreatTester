/* Module includes*/
var express      = require('express');
var bodyParser   = require('body-parser');
var path         = require('path');
var url          = require('url');
var collection   = require('./mongo');
var passwordList = require('./password.json');
var app          = express();

/* Constants */
const PORT    = process.env.PORT || 3000;
const ROOT    = __dirname + '/public/';
const USER    = "user";
const COUNTER = "counter";
const LOG     = "log";

/* Middle Ware */
app.use(bodyParser());
app.use(express.static(ROOT));

/* Routes */
app.post('/login', function(req, res) {
    var data = req.body;

    if(data.passwordType === 1) {
        data.password_1 = data.password;
    }
    else if(data.passwordType === 2) {
        data.password_2 = data.password;
    }
    else if(data.passwordType === 3) {
        data.password_3 = data.password;
    }

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

app.post('/log', function(req, res) {
    var data = req.body;

    collection(LOG, (db)=>{
        db.insert(data, ()=>{
            res.sendStatus(200);        
        });
    });
});

app.get('/log', function(req, res) {
    collection(LOG, (db)=>{
        db.find({}).toArray((err, data)=>{
            res.send(JSON.stringify(data));        
        });
    });
});

app.get('/register', function(req, res) {
    /* generate userId(auto-incremented number) 
     * and password, log to DB, response data in JSON
     */
    var userData;
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

function User(userId, password_1, password_2, password_3) {
    this.userId     = userId;
    this.password_1 = password_1;
    this.password_2 = password_2;
    this.password_3 = password_3;
};

function randomIndex() {
    return Math.floor((Math.random() * (passwordList.password.length - 1)));
};

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

function initCounter(callback) {
    var counter = {_id: "userId", seq:0};

    collection(COUNTER, (db)=>{
        db.count((err, count)=>{
            if(! err && count === 0) {
                db.insert(counter);
            }
            callback();
        });
    });
};

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

function start() {
    initCounter(()=>{
        console.log('Server running on port: ' + PORT);
    });
};

/* Start server */
app.listen(PORT, start);

