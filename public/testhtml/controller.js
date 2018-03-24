function postUserText1()
{
  alert('Returned from callback1');
}

function postUserText2()
{
  alert('Returned from callback2');
}

function postUserText3()
{
  alert('Returned from callback3');
}

function postUserText4()
{
  alert('Returned from callback4');
}

function callback1()
{
  var userRequestObj = {Log: {timeStamp: "2018: March 3rd", userId: 20, header: "Googel chrome", result: "Test was a success"}};
  var userRequestJSON = JSON.stringify(userRequestObj);
  $.post("log", userRequestJSON, postUserText1);
}

function callback2()
{
  var userRequestObj = {Name: 'Steve'};
  var userRequestJSON = JSON.stringify(userRequestObj);
  $.post("getLog", userRequestJSON, postUserText2);
}

function callback3()
{
  var userRequestObj = {userId: 20, password: "password"};
  var userRequestJSON = JSON.stringify(userRequestObj);
  $.post("login", userRequestJSON, postUserText3);
}

function callback4()
{
  var userRequestObj = {userId: 20, password: "password"};
  var userRequestJSON = JSON.stringify(userRequestObj);
  $.post("register", userRequestJSON, postUserText4);
}

$("#testRoute1").click(callback1);
$("#testRoute2").click(callback2);
$("#testRoute3").click(callback3);
$("#testRoute4").click(callback4);
