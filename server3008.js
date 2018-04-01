//list of required vars needed
//steven double check this
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var hat = require('hat');

app.use("/password",bodyParser.urlencoded({extended:true}));
// the post method, posting to the database with new users
app.post("/password", cookieParser(),function(req,res){
  var print = req.body;
  if(print.name==""){
    console.log("User has not inputted a name");
    res.sendStatus(400);
  }else{
      MongoClient.connect("mongodb://localhost:27017/passwordDB", function(err,db){
        if(err){ // failed to connected to database
          console.log('Failed to connect to database');
          res.sendStatus(500);
          db.close();
        }else{
          console.log('connected to database');
          var collection = db.collection("passwords");
          collection.findOne({name: req.body.name}, function(err,result){
              if(err){
                console.log("error occured");
                res.sendStatus(500);
                db.close();
              }else if(result){ // if it exists
                console.log('user found and already exists try again');
              }else{// if no username exists
                //information should contain the users generated password, include
                //a function in before this line to get the passwords and input it into them
                //variable information conscutor, its at the bottom, the second
                //parameter is the password
                var information = new Information(req.body.name,req.body.name);
                //error checking, see if it actually sends the username
                console.log(information);
                db.collection("passwords").insert(information,function(err,result){
                  if(err){
                    console.log("error sending to db");
                    res.sendStatus(500);
                  }else{
                    console.log("sent to database");
                    res.redirect("/");
                  }
                });
                db.close();
              }
          });
        }
      });
  }
});

app.get("recipe/:userName",cookieParser(),function(req,res){
  var username = req.params.userName;
  MongoClient.connection("mongodb://localhost:27017/passwordDB", function(err,db){
    if(err){
      console.log("failed ot connect to database");
      res.sendStatus(500);
      db.close();
    }else{
      console.log("connected to database");
      var cursor = db.collection("passwords");
      cursor.findOne({name:username},function(err,user){
        if(err){
          console.log("error occured");
          db.close();
        }else{
          var passwordToSend = {};
          passwordToSend.name = user.name;
          // the line below is just a filler for now since we haven't posted with a password above
          passwordToSend.password = user.password;
          //error checking to see if it has the name/password correctly
          console.log(passwordToSend);
          res.send(passwordToSend);
        }
      });
    }
  });
});


function Information(name,password){
  this.name = name;
  this.password = password;
}
