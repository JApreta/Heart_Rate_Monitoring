$(function() {
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
                    localStorage.setItem("token", data.token)
                    localStorage.setItem("userType", data.userType)
                    if (data.userType == "patient")
                        $(location).attr('href', '../patient/dashboard.html');
                    else if (data.userType == "physician") $(location).attr('href', '../physician/dashboard.html');

                }
            })
            .fail(function(data, textStatus, jqXHR) {

                alert(JSON.stringify(data.responseJSON.error))
                    //$(location).attr('href', '../patient/dashboard.html');
            });

    });


    if ((localStorage.getItem("token") == null) && localStorage.getItem("userType") == null) {
        $('#loginLogout').removeClass('dropdown')
        $('#loginLogout').html(`<a class="nav-link" href="login.html">Login</a>`)
        $('#signupOpt').css('display', 'block')
    } else {
        if (localStorage.getItem("userType") == "patient") {
            $('#loginLogout').addClass('dropdown')
            $('#loginLogout').html(`
         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-solid fa-user-gear"></i> </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" onclick="logout()">Logout</a></li>
                            <li><a class="dropdown-item" href="patient/dashboard.html">Patient Portal</a></li>
                        </ul>`)
        } else {
            $('#loginLogout').addClass('dropdown')
            $('#loginLogout').html(`
         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-solid fa-user-gear"></i> </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" onclick="logout()">Logout</a></li>
                            <li><a class="dropdown-item" href="physician/dashboard.html">Patient Portal</a></li>
                        </ul>`)
        }
        $('#signupOpt').css('display', 'none')
    }
});

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    $(location).attr('href', '../index.html');
}