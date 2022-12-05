 var physicians

 //this function makes an api call to the server to remove a device from the user's account
 function removeDevice(id) {
     $.ajax({
             url: `../../../api/patient/remove-device/${id}`, //server endpoint to remove the device
             method: 'DELETE',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //get the auth token
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) { // if device removed
                 alert(JSON.stringify(data.message)) //show success message
                 getDeviceList() //reload the device list
             } else { // if error
                 alert(JSON.stringify(data.responseJSON.error)) //show message
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))
         });
 }

 //this function makes an api call to the srver to get the user's device list
 function getDeviceList() {
     $.ajax({
             url: '../../../api/patient/device-list', // server end point to get the device list
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //get the auth token
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             //creates the table to laod the list on the page
             let deviceListInfo = `<h3>Device List</h3><table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Device ID</th>
                                        <th scope="col">API KEY</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>`
             if (jqXHR.status == 200) {

                 if (data.length > 0) {
                     //populates the table with the devices from the db
                     for (let i = 0; i < data.length; i++) {
                         deviceListInfo += ` <tr>
                                        <th scope="row">${i+1}</th>
                                        <td>${data[i].device_id}</td>
                                        <td>${data[i].device_apiKey}</td>
                                        <td><button type="button" class="btn btn-danger" onclick="removeDevice('${data[i].device_id}')">Remove</button></td>
                                    </tr>`
                     }
                     deviceListInfo += ` </tbody></table>`
                     $('#deviceInfoList').html(deviceListInfo) // display the list on the page
                 } else {
                     $('#deviceInfoList').html('<h3>Your Device List is Empty</h3>') // if no devices registered
                 }
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))

         });
 }

 //this function makes an api call to get the user basic info like user;s full name and email
 function getUserInfo() {
     $.ajax({
             url: '../../../api/patient/dashboard', //server endpoint to get the user info
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` // user ath token
             },
             dataType: 'json'
         })
         .done(async function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) {
                 getPhysicianList() //get the list of available physicians
                 let myPhysician, physicianList = '<option selected disabled value="">Choose your Physician</option>'

                 $('#email').val(data.email) //show the user's email
                 $('#firstName').val(data.firstName) //show the user's 1st name
                 $('#lastName').val(data.lastName) //shpw the user last name
                 localStorage.setItem("userEmail", data.email) // save the user's email on localstorage for future use
                 for (let i = 0; i < physicians.length; i++) { //load the physician list to be displayed 
                     physicianList += `<option value="${physicians[i].email}">${physicians[i].firstName} ${physicians[i].lastName}</option>`
                     if (data.physician_email == physicians[i].email)
                         myPhysician = physicians[i]
                 }
                 $('#physicianList').html(physicianList) //display the physician list

                 if (data.hasOwnProperty('physician_email')) { //if user has selected a physician-- show the selected physician info
                     $('#physicianInfo').html(`<h4>Current Physician</h4>
                                    <p class="card-text">name: ${myPhysician.firstName} ${myPhysician.lastName}</p>
                                    <p class="card-text">contact: ${myPhysician.email}</p>`)

                 } else {
                     $('#physicianInfo').html("<h4> You haven't selected a Physician<h4/>")
                 }
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))

         });
 }

 //this functions makes an api call to the server to
 async function getPhysicianList() {

     await $.ajax({
             async: false,
             url: '../../../api/patient/physician-list',
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) {
                 physicians = data
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))

         });

 }

 //this function makes an api call to the srver to updated the paient physician
 $("#myPhysicianForm").submit(function(event) {
     event.preventDefault();
     var selectedPhysician = $('#physicianList').find(":selected").val()
     if (selectedPhysician === "") {
         window.alert("Invalid Physician Selection!")
         return;
     } else {
         $.ajax({
                 url: '../../../api/patient/update-physician', //srver endpoint to update the patient physician
                 method: 'PUT',
                 headers: {
                     contentType: 'application/json',
                     authorization: `Bearer ${localStorage.getItem("token")}` //user auth token
                 },
                 data: { physician_email: selectedPhysician }, //set the physicina data to be sent to the srver
                 dataType: 'json'
             })
             .done(function(data, textStatus, jqXHR) {
                 if (jqXHR.status == 200) { //if update was done
                     alert(JSON.stringify(data.message)) //show success message
                     getUserInfo() //reload user info to show updated info
                 } else { //show the error message if there is any
                     alert(JSON.stringify(data.responseJSON.error))
                 }
             })
             .fail(function(data, textStatus, jqXHR) {
                 alert(JSON.stringify(data.responseJSON.error))
             });
     }
 });

 //this function makes an api call to the server  to add a new device to the user's account
 $("#newdeviceForm").submit(function(event) {
     event.preventDefault();
     let newdeviceId = $('#Newdevice_id').val()
     if (newdeviceId === "") { // check if an id was given
         window.alert("Invalid Device ID!")
         return;
     } else {
         $.ajax({
                 url: '../../../api/patient/add-device', //server endpoint to add a user's device
                 method: 'POST',
                 headers: {
                     contentType: 'application/json',
                     authorization: `Bearer ${localStorage.getItem("token")}` //user auth token
                 },
                 data: { device_id: newdeviceId }, //get the device id to be sent to the srver
                 dataType: 'json'
             })
             .done(function(data, textStatus, jqXHR) {
                 if (jqXHR.status == 200) { //if the device was added
                     alert(JSON.stringify(data.message)) //show success message
                     getDeviceList() //load the device list to show updated info
                 } else { //if there is an error for some reason-- show the error message
                     alert(JSON.stringify(data.responseJSON.error))
                 }
             })
             .fail(function(data, textStatus, jqXHR) {
                 alert(JSON.stringify(data.responseJSON.error))
             });
     }
 });

 //this function makes an api call to the srver to update the user's full name
 $("#myInfoForm").submit(function(event) {

     event.preventDefault();

     if ($('#firstName').val() === "") { //validated the 1st name
         window.alert("Invalid First Name!");
         return;
     }
     if ($('#lastName').val() === "") { // validate the last name
         window.alert("Invalid Last Name!");
         return;
     }
     var userData = { //get the user data to be sent to the srver
         firstName: $('#firstName').val(),
         lastName: $('#lastName').val()
     }

     $.ajax({
             url: '../../../api/patient/update-user-info', //server endpoint to update the user info
             method: 'PUT',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //user auth tokrn
             },
             data: userData,
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) { //if info was updated
                 alert(JSON.stringify(data.message)) //show success message
                 getUserInfo() //load the user info to show the updated info
             } else { //show the error message if something wnet wrong
                 alert(JSON.stringify(data.responseJSON.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))
         });
 });

 //handles form submissin to update the measurment frequency
 $("#measurFreq").submit(function(event) {
     event.preventDefault();
     if ($('#betweenMeas').val() === "") { //check if an input was given
         window.alert("invalide Frequency value!");
         return;
     }
     var userData = { //get the freq valeu and the user email to be updated
         arg: { "delayokay": $('#betweenMeas').val() },
         email: localStorage.getItem("userEmail")
     }
     $.ajax({ // make an ajax call to server to update the freq
             url: '../../../api/patient/measurment-frequency',
             method: 'POST',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //user auth token
             },
             data: userData,
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) { // check if update was done
                 alert(JSON.stringify(data.message)) // and show success message
             } else { // if failed 
                 alert(JSON.stringify(data.responseJSON.error)) //show error message
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))
         });
 });

 //this function makes an api call to get the user max min avg heart rate from the srver
 function getWeeklyReport() {
     $.ajax({
             url: '../../../api/patient/weekly-summary', // srver endpoint to get the max min avg rate data
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //user auth token
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) { //if data was recived
                 const today = new Date()
                 const Startday = new Date(today.getTime())
                 const sevenDaysAgo = new Date(today.getTime())
                 Startday.setDate(today.getDate()) //get tha last day reading date
                 sevenDaysAgo.setDate(today.getDate() - 7) //get the 1st day reading date
                 $('#minRate').html(`${data.min} BPM`) //show the min rate
                 $('#maxRate').html(`${data.max} BPM`) //show the max rate
                 $('#avgRate').html(`${data.avg.toFixed(2)} BPM`) //show the avg rate
                 $('#wReportDate').html(`
                  From ${sevenDaysAgo.getMonth()+1}/${sevenDaysAgo.getDate()}/${sevenDaysAgo.getFullYear()}
                 To ${Startday.getMonth()+1}/${Startday.getDate()}/${Startday.getFullYear()}  
                 `) //show the the reading dates
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))
         });
 }

 //this function makes an api call to the srver to get the user's heart rate and O2 data 
 //from a selecetd day and displays the data on a line and bar graphs
 function getDailyReport(readingDate) {

     $.ajax({
             url: '../../../api/patient/daily-summary', //server endpoint to gat the graph data
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}` //user auth token
             },
             data: { "selectedDate": readingDate, "email": localStorage.getItem("userEmail") }, //set the user email and select day to be sent to thesrever
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) {
                 //load heart rate line graph
                 new Chart('rateGraph', {
                     type: 'line',
                     data: {
                         datasets: [{
                             label: 'HEART RATE',
                             data: data.rate,
                             borderColor: 'white',
                             fill: 'false',
                         }]
                     },
                     options: {
                         scales: {
                             yAxes: [{
                                 ticks: {
                                     beginAtZero: true
                                 }
                             }],
                             xAxes: [{
                                 type: 'time',
                                 time: {
                                     parser: 'H:mm',
                                     unit: 'hour',
                                     stepSize: 1,
                                     displayFormats: {
                                         hour: 'H:mm'
                                     },
                                     tooltipFormat: 'H:mm'
                                 },
                                 ticks: {
                                     min: '0:00',
                                     max: '23:59'
                                 }
                             }]
                         }
                     }
                 });
                 //load heart O2 line graph 
                 new Chart('oxyGraph', {
                     type: 'line',
                     data: {
                         datasets: [{
                             label: 'Blood Oxygen Saturation',
                             data: data.oxy,
                             borderColor: 'white',
                             fill: 'false',
                         }]
                     },
                     options: {
                         scales: {
                             yAxes: [{
                                 ticks: {
                                     beginAtZero: true
                                 }
                             }],
                             xAxes: [{
                                 type: 'time',
                                 time: {
                                     parser: 'H:mm',
                                     unit: 'hour',
                                     stepSize: 1,
                                     displayFormats: {
                                         hour: 'H:mm'
                                     },
                                     tooltipFormat: 'H:mm'
                                 },
                                 ticks: {
                                     min: '0:00',
                                     max: '23:59'
                                 }
                             }]
                         }
                     }
                 });
                 //load heart rate bar graph
                 new Chart('rateBarGraph', {
                     type: 'bar',
                     data: {
                         labels: data.barLabel,
                         datasets: [{
                             label: 'HEART RATE',
                             data: data.barRates,
                             backgroundColor: graphBgColor(data.barLabel.length),
                         }]
                     },
                     options: {
                         scales: {
                             y: {
                                 beginAtZero: true
                             }
                         }
                     }
                 });
                 //load heart O2 bar graph
                 new Chart('oxyBarGraph', {
                     type: 'bar',
                     data: {
                         labels: data.barLabel,
                         datasets: [{
                             label: 'Blood Oxygen Saturation',
                             data: data.barOxy,
                             backgroundColor: graphBgColor(data.barLabel.length),
                         }]
                     },
                     options: {
                         scales: {
                             y: {
                                 beginAtZero: true
                             }
                         }
                     }
                 });
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))

         });
 }

 $("#readingDate").change(function() {
     let dat = $("#readingDate").val().split('-')
     getDailyReport(`${dat[1]}/${dat[2]}/${dat[0]}`)

 })
 $("#patientWReport").click(function() { getWeeklyReport() })
 $("#showDeviceList").click(function() { getDeviceList() })

 //this function retuns an array for colors to be user on the bar graph for the weekly summary
 function graphBgColor(length) {
     let bgColor = []
     for (let i = 0; i < length; i++)
         bgColor.push('rgba(153, 102, 255)')
     return bgColor
 }

 //this function logout the user by removing the localStorage data
 function logout() {
     localStorage.removeItem("token")
     localStorage.removeItem("userType")
     localStorage.removeItem("userEmail")
     $(location).attr('href', '../index.html');
 }

 getUserInfo()