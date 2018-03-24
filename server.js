
/* Module includes*/
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let qstring = require('querystring');
var url = require('url');
let app = express();

/* Constants */
 const PORT = process.env.PORT || 80;
 const ROOT = __dirname + '/public/';

/* Middle Ware */
app.use(bodyParser());
app.use(express.static(ROOT));

/* Routes */

/*
  Timestamp, UserId, Client Header (browser), Result of login,
  Format: {Log: {timeStamp: “”, userId: number, header: “”, result: “”}}
*/
app.post('/log', function(req, res)
{
  let reqData = ''
  req.on('data', function (chunk) {
    reqData += chunk
  })
  req.on('end', function()
  {
    /* TODO enter user json into database see format above for data */
    let dataObj = JSON.parse(reqData);
    console.log(dataObj);
    console.log('timeStamp: ' +
                 dataObj.Log.timeStamp + ', UserID: ' +
                 dataObj.Log.userId + ', Header: ' +
                 dataObj.Log.header + ', result: ' +
                 dataObj.Log.result);

    res.send('<h1>Post Log data</h1>');
  })
});

/*
  Expecting {Name: "userID"} as input to server
  Send this format to client: {Log: {timeStamp: “”, userId: number, header: “”, result: “”}}
*/
app.post('/getLog', function(req, res)
{
  let reqData = ''
  req.on('data', function (chunk) {
    reqData += chunk
  })
  req.on('end', function()
  {
    /* TODO Get data from database matching client ID then send back to them */
    let dataObj = JSON.parse(reqData);
    //userID is the name for the user, so send back the users data
    let userID = dataObj.Name;
    console.log('userID is: ' + userID);
    res.send('<h1>get Log data</h1>');
  })
});

/* Expected format {userId: number, password: “passwd”} */
app.post('/login', function(req, res)
{
    var body = req.body;
    console.log(body);
    //This will contain userID and password
    //let dataObj = JSON.parse(reqData); 
    //let userID = dataObj.userId;
    //let password = dataObj.password;

    //TODO
    //Check Attempts to see if they exceeded the number of attempts they have
    //Get users stored password and compare to given password
    //If correct send back to user success, set attempts to 0
    //If not correct send back to user failed, then set attempts += 1
      res.sendStatus(401); //send 401 if login fail
    //  res.sendStatus(200); // send 200 if success
});

app.get('/register', function(req, res)
{
    /* generate userId(auto-incremented number) 
     * and password, log to DB, response data in JSON
     */
    var userData = {userId: 1, password_1: "ThisIsTest", password_2: "ThisIsTseT", password_3: "ThisIzTez"};
    res.send(JSON.stringify(userData));
});

app.post('/register', function(req, res)
{
  let reqData = ''
  req.on('data', function (chunk) {
    reqData += chunk
  })
  req.on('end', function()
  {
    //This will contain userID and password
    let dataObj = JSON.parse(reqData);
    let userID = dataObj.userId;
    let password = dataObj.password;

    console.log('User ID: ' + userID + ', Password is: ' + password);
    //TODO
    //check for duplicate ID's
    //Add users to database
    //Send back success or failure username already taken
    res.send('<h1>post loggin</h1>');
  })
});

/* Start server */
 app.listen(PORT, start);

 function start()
 {
   console.log('Server running on port: ' + PORT);
 }
