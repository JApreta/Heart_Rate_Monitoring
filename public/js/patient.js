const { $where } = require("../../models/user");

function validate() {

    $('#signUpForm').submit();


    // // data validation
    // if ($('#fname').val() === "") {
    //     window.alert("Invalid First Name!");
    //     return;
    // }
    // if ($('#lname').val() === "") {
    //     window.alert("Invalid Last Name!");
    //     return;
    // }
    // if ($('#email').val() === "") {
    //     window.alert("Invalid Email!");
    //     return;
    // }

    // // password validation
    // var pwd = $("#pwd").val();
    // if (!((pwd.length >= 10) && (pwd.length <= 20))) {
    //     window.alert("Password must be between 10 and 20 characters!");
    //     return;
    // }
    // if (!/[a-z]+/.test(pwd)) {
    //     window.alert("Password must contain at least one lowercase character!");
    //     return;
    // }
    // if (!/[A-Z]+/.test(pwd)) {
    //     window.alert("Password must contain at least one uppercase character!");
    //     return;
    // }
    // if (!/\d+/.test(pwd)) {
    //     window.alert("Password must contain at least one digit!");
    //     return;
    // }
    // if (pwd != $("#confirm_pwd").val()) {
    //     window.alert("Passwords Don't Match!");
    //     return;
    // }
    // var device = ('#device').val()
    // var token = ('#particle_token').val()

    // if (!validate_device_token(token, device)) {
    //     window.alert("Incorrcet Device ID and/or Token!");
    //     return;
    // } 
};

// function validate_device_token(token, device) {

//     var particle = new Particle();
//     let validate = false

//     var devicesPr = particle.getDevice({ deviceId: device, auth: token });

//     devicesPr.then(
//         function(data) {
//             validate = true
//         },
//         function(err) {
//             validate = false
//         }
//     );
//     return validate
// }