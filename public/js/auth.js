 $("#signUpForm").submit(function(event) {

     event.preventDefault();

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
         device_id: $('#device_id').val(),
         particle_token: $('#particle_token').val(),
     }

     // send new user details to server

     $.ajax({
             url: '../../../api/patient/create',
             method: 'POST',
             contentType: 'application/json',
             data: JSON.stringify(userData),
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 201) {
                 alert(JSON.stringify(textStatus))
                 console.log(JSON.stringify(data))

             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))
             $(location).attr('href', '../patient/dashboard.html');
         });

 });