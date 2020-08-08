src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";


//find the document, and when everything is ready:
$(document).ready(function () {
    $('#btn').click(function () {    //when the submit button is clicked, execute this function.

        var username = $('#textBoxUsernameID').val();
        var password = $('#textBoxPasswordID').val();
        var email = $('#textBoxEmailID').val();

        $.ajax({
            url: 'http://localhost/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                "username": "homi",
                "password": "pass",
                "userId": "sdf",
                "email": "mailll"
            })
        });

    })
