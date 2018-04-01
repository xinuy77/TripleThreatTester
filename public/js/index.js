var userId;
var attempt      = 0;
var passwordType = 1; // 1 = password_1, 2 = password_2, 3 = password_3
var performance  = window.performance;
var startTime;
var endTime;
var logData = [];

M.AutoInit();

$(document).ready(()=>{
    listenStartButton();
});

function log(userId, passwordType, duration, result) {
    this.UserId       = userId;
    this.PasswordType = passwordType;
    this.Duration     = duration; //time duration of attempt in millisecond
    this.Result       = result;
};

function listenStartButton() {
    $("#startTestButton").click(()=>{
        $("#ui_1").fadeOut(null, ()=>{
            showPassword();
        });
    });
};

function showPassword() {
    register((data, err)=>{
        if(data === -1) {
            showErr(err);
        }
        else {
            data    = JSON.parse(data);
            userId  = data.userId;
            attempt = 3;
            listenNextButton();
            $("#password1").text(data.password_1);
            $("#password2").text(data.password_2);
            $("#password3").text(data.password_3);
            $("#ui_2").fadeIn();
        }
    });
};

function listenNextButton() {
    $("#nextButton").click(()=>{
        $("#ui_2").fadeOut(null, ()=>{
            showPasswordInput();
        });
    });
};

function showPasswordInput() {
    refreshAttemptCounter();
    if(passwordType === 1) {
        $("#service").text("Email");
        listenLoginButton();
        listenLoginInput();
    }
    else if(passwordType === 2) {
        $("#service").text("Shopping");
    }
    else if(passwordType === 3) {
        $("#service").text("Banking");
    }
    $("#ui_3").fadeIn(null, ()=>{
        startTime = performance.now();
    });
};

function refreshAttemptCounter() {
    $("#counter").text(attempt);
};

function listenLoginButton() {
    $("#loginButton").click(()=>{
        var password = $("#passwordInput").val();
        login(password);
    });
};

function listenLoginInput() {
    $("#passwordInput").keypress((e)=>{
        var password = $("#passwordInput").val();
        if(e.which === 13) {
            login(password);
        }
    });
};

function showErr(err) {
    $("#err_msg").text(err);
    $("#ui_err").fadeIn();
};

function showAttemptExceed() {
    M.toast({html: '<h4 class="red-text">Attempt Exceeded!</h4>', displayLength:500});
    nextPhase();
};

function nextPhase() {
    attempt = 3;
    if(passwordType != 3) {
        passwordType++;
        $("#ui_3").fadeOut(null,()=>{
            showPasswordInput();
        });
    }
    else {
        showEnd();
    }
};

function showEnd() {
    $("#ui_3").fadeOut(null, ()=>{
        $("#ui_end").fadeIn();
        postLog();
    });
};

function postLog() {
    api("POST", "/log", JSON.stringify(logData), (res)=>{/*donothing*/});
};

function login(password) {
    var data = {userId: userId, password: password, passwordType: passwordType};
    $("#passwordInput").val('');
    endTime  = performance.now();
    api("POST", "/login", JSON.stringify(data), (res)=>{
        if(res === -1) {
            attempt--;
            M.toast({html: '<h4>Incorrect Password!</h4>', displayLength:500});
            logData[logData.length] = new log(userId, passwordType, (endTime-startTime), "LoginFailed"); 
            if(attempt === 0) {
                showAttemptExceed();
            }
            else {
                refreshAttemptCounter();
            }
        }
        else {
            console.log(data);
            console.log(res);
            M.toast({html: '<h4>Successful Login!</h4>', displayLength: 500});
            logData[logData.length] = new log(userId, passwordType, (endTime-startTime), "LoginSuccess"); 
            nextPhase();
        }
    });
};

function register(callback) {
    api("GET", "/register", null, (res)=>{
        if(res === -1) {
            callback(res, "FAILED TO CONNECT API");
        }
        else {
            callback(res, null);
        }
    });
};

function api(type, url, data=null, callback) {
return $.ajax({
    type: type,
    contentType: "application/json",
    url: url,
    data: data,
    dataType: "text",
    error: (xhr, stat, err)=>{
        callback(-1);
    },
    success: (res=null)=>{
        callback(res);
    }
});
}
