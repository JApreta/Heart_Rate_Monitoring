    $("#signUpForm").submit(function(event) {

        event.preventDefault();
        $("#btnCreatePhy").disabled = true

        // data validation
        if ($('#firstName').val() === "") {
            window.alert("Invalid First Name!");
            return;
        }
        if ($('#lastName').val() === "") {
            window.alert("Invalid Last Name!");
            return;
        }
        if ($('#email').val() === "") {
            window.alert("Invalid Email!");
            return;
        }

        // password validation
        var pwd = $("#password").val();
        if (!((pwd.length >= 10) && (pwd.length <= 20))) {
            window.alert("Password must be between 10 and 20 characters!");
            return;
        }
        if (!/[a-z]+/.test(pwd)) {
            window.alert("Password must contain at least one lowercase character!");
            return;
        }
        if (!/[A-Z]+/.test(pwd)) {
            window.alert("Password must contain at least one uppercase character!");
            return;
        }
        if (!/\d+/.test(pwd)) {
            window.alert("Password must contain at least one digit!");
            return;
        }
        if (pwd != $("#confirm_pwd").val()) {
            window.alert("Passwords Don't Match!");
            return;
        }

        var userData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            password: pwd,
        };

        // send new user details to server

        $.ajax({
                url: '../../../api/physician/create',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(userData),
                dataType: 'json'
            })
            .done(function(data, textStatus, jqXHR) {
                $("#signUpForm").trigger("reset")
                $("#btnCreatePhy").disabled = false
                if (jqXHR.status == 201) {

                    alert(JSON.stringify(data.message))

                    $(location).attr('href', '../login.html')
                } else {
                    alert(JSON.stringify(data.error))
                }
            })
            .fail(function(data, textStatus, jqXHR) {
                $("#signUpForm").trigger("reset")
                $("#btnCreatePhy").disabled = false
                alert(JSON.stringify(data.responseJSON.error))

            });

    });