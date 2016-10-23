



$(document).ready(function() {

    $('#sentdata').on('click', function() {
        //alert(JSON.parse($('#datainput').val()));
        $.ajax({
            method: "POST",
            url: '/sim',
            data: {
                data: JSON.parse($('#datainput').val())
            }
        })
    })

    $('#23metoPers').on('click', function() {
        // need to pop up a modal with 23 and me insights
        console.log('Sending to only genetics');
        $.ajax({
            method: "POST",
            url: "/send-only-genetics",
            data: {
                code: getCookie("thisUser")
            },
            success: function(data) {
                console.log(data);
            }
        });
    });

    $('#TwittertoGenetics').on('click', function() {
        // need to pop up a dialog box for twitter handle
        console.log('Sending only twitter');
        $.ajax({
            method: "POST",
            url: "/send-only-twitter",
            data: {
                twitterHandle: getCookie("thisUserTwitterHandle")
            }
        });
    });


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

    $("#sendToServer").on("click", function() {
        console.log('Sending to server');
        $.ajax({
            method: "POST",
            url: "/send-to-server",
            data: {
                code: getCookie("thisUser") ,
                twitterHandle: getCookie("thisUserTwitterHandle")
            }
        });
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
