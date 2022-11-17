$("#loginForm").submit(function(event) {

    event.preventDefault();
    // password validation

    var userData = {

        email: $('#email').val(),
        password: $("#password").val()
    }

    // send new user details to server

    $.ajax({
            url: '../../../login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {

                console.log(JSON.stringify(data))
                localStorage.setItem("token", data.token);
                localStorage.setItem("userType", data.userType)
                if (data.userType == "patient")
                    $(location).attr('href', '../patient/dashboard.html');
                else if (data.userType == "physician") $(location).attr('href', '../physician/dashboard.html');

            }
        })
        .fail(function(data, textStatus, jqXHR) {

            alert(JSON.stringify(data.responseJSON.error))
            $(location).attr('href', '../patient/dashboard.html');
        });

});