var userId;
var attempt      = 0;
var passwordType = 1;
M.AutoInit();

$(document).ready(()=>{
    listenStartButton();
});

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
    $("#ui_3").fadeIn();
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
    M.toast({html: '<h4 class="red-text">Attempt Exceeded!</h4>'});
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
    });
};

function login(password) {
    var data = {userId: userId, password: password, passwordType: passwordType};
    api("POST", "/login", JSON.stringify(data), (res)=>{
        if(res === -1) {
            attempt--;
            M.toast({html: '<h4>Incorrect Password!</h4>'});
            if(attempt === 0) {
                showAttemptExceed();
            }
            else {
                refreshAttemptCounter();
            }
        }
        else {
            M.toast({html: '<h4>Successful Login!</h4>'});
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
