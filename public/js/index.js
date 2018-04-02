/* Glboal Variables */
var userId;
var attempt      = 0;
var passwordType = 1; // 1 = password_1, 2 = password_2, 3 = password_3
var performance  = window.performance;
var startTime;
var endTime;
var logData = [];

M.AutoInit();

// listen start button 
// when html is fully loaded
$(document).ready(()=>{
    listenStartButton();
});

/**
 * Log object
 *
 * @param string timestamp
 * @param number passwordType
 * @param number duration // This is in milli-second
 * @param string result
 */
function log(timestamp, userId, passwordType, duration, result) {
    this.Date         = timestamp;
    this.UserId       = userId;
    this.PasswordType = passwordType;
    this.Duration     = duration; //time duration of attempt in millisecond
    this.Result       = result;
};

/**
 * Sets even to start button.
 * When clicked, show password
 * to user
 */
function listenStartButton() {
    $("#startTestButton").click(()=>{
        $("#ui_1").fadeOut(null, ()=>{
            showPassword();
        });
    });
};

/**
 * Registers and recieve
 * userId and password from api,
 * show them to user
 */
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

/**
 * Set event to Next button.
 * Show password Input UI when
 * clicked.
 */
function listenNextButton() {
    $("#nextButton").click(()=>{
        $("#ui_2").fadeOut(null, ()=>{
            showPasswordInput();
        });
    });
};

/**
 * Shows password input UI 
 * to user.
 */
function showPasswordInput() {
    refreshAttemptCounter();

    // Change the service text accordingly
    // depending on passwordType(global)
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

    // When UI is shown, record start time
    $("#ui_3").fadeIn(null, ()=>{
        startTime = performance.now(); 
    });
};

/**
 * Refreshes attempt counter
 */
function refreshAttemptCounter() {
    $("#counter").text(attempt);
};

/**
 * Set event to Login Button.
 * When clicked, sends password
 * to API
 */
function listenLoginButton() {
    $("#loginButton").click(()=>{
        var password = $("#passwordInput").val();
        login(password);
    });
};

/**
 * Set event on Login Input
 * When Enter key pressed, 
 * sends password to API
 */
function listenLoginInput() {
    $("#passwordInput").keypress((e)=>{
        var password = $("#passwordInput").val();
        if(e.which === 13) {
            login(password);
        }
    });
};

/**
 * Shows error UI 
 */
function showErr(err) {
    $("#err_msg").text(err);
    $("#ui_err").fadeIn();
};

/**
 * Shows attempt exceed toast,
 * refreshes phase
 */
function showAttemptExceed() {
    M.toast({html: '<h4 class="red-text">Attempt Exceeded!</h4>', displayLength:500});
    nextPhase();
};

/**
 * Resets attempt counter, 
 * shows user next password input
 * phase.
 */
function nextPhase() {
    attempt = 3;

    // Show End UI if password Type is 3
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

/**
 * Shows End UI,
 * sends log to API
 */
function showEnd() {
    $("#ui_3").fadeOut(null, ()=>{
        $("#ui_end").fadeIn();
        postLog();
    });
};

/**
 * Posts log to API
 */
function postLog() {
    api("POST", "/log", JSON.stringify(logData), (res)=>{/*donothing*/});
};

/**
 * Attempts login by sending request
 * to API
 * 
 * @param string password
 */
function login(password) {
    var data = {userId: userId, password: password, passwordType: passwordType};
    $("#passwordInput").val('');
    endTime  = performance.now(); // Record End Time 

    // Sends API post request
    api("POST", "/login", JSON.stringify(data), (res)=>{

        // If response is -1, this means login failed
        // else, login is success
        if(res === -1) {
            // Decrements attempt counter, show toast, logs data
            attempt--;
            M.toast({html: '<h4>Incorrect Password!</h4>', displayLength:500});
            logData[logData.length] = new log(new Date().toLocaleString(), userId, passwordType, (endTime-startTime), "LoginFailed"); 

            // Show attempt exceeded if attempt counter is 0
            // Refresh attempt counter in UI otherwise
            if(attempt === 0) {
                showAttemptExceed();
            }
            else {
                refreshAttemptCounter();
            }
        }
        else {
            // Show toast, log data, go to next phase
            M.toast({html: '<h4>Successful Login!</h4>', displayLength: 500});
            logData[logData.length] = new log(new Date().toLocaleString(), userId, passwordType, (endTime-startTime), "LoginSuccess"); 
            nextPhase();
        }
    });
};

/**
 * Register user by sending
 * request to API. Status returned
 * to callback.
 *
 * @param function callback
 */
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

/**
 * Sends request to API accordingly
 * to parameter, returns status to callback
 *
 * @param string   type     // either "POST" or "GET"
 * @param string   url      // route
 * @param string   data     // stringified JSON object
 * @param function callback 
 *
 * @return $.ajax() // returns ajax instance
 */
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
};
