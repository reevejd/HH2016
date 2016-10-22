var socket = io()




socket.on("whatever", function(data) {
    console.log('You got data from the server:')
    console.log(data);
});

$(document).ready(function() {
    if (window.location.href.includes('?code=')) {
        var thisUser;
        thisUser = window.location.href.split('?code=')[1];
        setCookie("thisUser", thisUser, 365);
    }
    console.log(window.location.href);
    if (window.location.href.includes('?twitter_handle=%40')) {
      var thisUserTwitterHandle;
      thisUserTwitterHandle = window.location.href.split('?twitter_handle=%40')[1];
      console.log(thisUserTwitterHandle);
      setCookie("thisUserTwitterHandle", thisUserTwitterHandle, 365);
    }


// sending stuff back to the server:
    $("#clickButton").on("click", function() {
        console.log('button clicked');
        $.ajax({
            method: "POST",
            url: "/test",
            data: {
                data1: "test1",
                data2: ["hi,", "test"]
            }
        });
    })

    $("#logButton").on("click", function() {
        console.log('log clicked');
        console.log("Client: " + getCookie("thisUser"));
        console.log("Client: " + getCookie("thisUserTwitterHandle"));
    })

    $("#clearCookiesButton").on("click", function() {
        console.log('clearCookies clicked');
        document.cookie = "thisUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "thisUserTwitterHandle=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        console.log("Cleared: " + getCookie("thisUser"));
        console.log("Cleared: " + getCookie("thisUserTwitterHandle"));
    })
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    if(getCookie(cname) == ""){
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}



// either use ajax:



//
