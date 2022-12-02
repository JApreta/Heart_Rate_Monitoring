 var physicians


 function removeDevice(id) {

     $.ajax({
             url: `../../../api/patient/remove-device/${id}`,
             method: 'DELETE',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) {
                 alert(JSON.stringify(data.message))
                 getDeviceList()

             } else {
                 alert(JSON.stringify(data.responseJSON.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))


         });
 }

 function getDeviceList() {
     $.ajax({
             url: '../../../api/patient/device-list',
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
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

                     for (let i = 0; i < data.length; i++) {
                         deviceListInfo += ` <tr>
                                        <th scope="row">${i+1}</th>
                                        <td>${data[i].device_id}</td>
                                        <td>${data[i].device_apiKey}</td>
                                        <td><button type="button" class="btn btn-danger" onclick="removeDevice('${data[i].device_id}')">Remove</button></td>
                                    </tr>`
                     }
                     deviceListInfo += ` </tbody></table>`
                     $('#deviceInfoList').html(deviceListInfo)
                 } else {
                     $('#deviceInfoList').html('<h3>Your Device List is Empty</h3>')
                 }
             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))

         });
 }

 function getUserInfo() {
     $.ajax({
             url: '../../../api/patient/dashboard',
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             dataType: 'json'
         })
         .done(async function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) {
                 getPhysicianList()

                 let myPhysician, physicianList = '<option selected disabled value="">Choose your Physician</option>'

                 $('#email').val(data.email)
                 $('#firstName').val(data.firstName)
                 $('#lastName').val(data.lastName)
                 localStorage.setItem("userEmail", data.email)
                 for (let i = 0; i < physicians.length; i++) {
                     physicianList += `<option value="${physicians[i].email}">${physicians[i].firstName} ${physicians[i].lastName}</option>`
                     if (data.physician_email == physicians[i].email)
                         myPhysician = physicians[i]
                 }
                 $('#physicianList').html(physicianList)

                 if (data.hasOwnProperty('physician_email')) {
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

 $("#myPhysicianForm").submit(function(event) {

     event.preventDefault();
     var selectedPhysician = $('#physicianList').find(":selected").val()

     if (selectedPhysician === "") {
         window.alert("Invalid Physician Selection!")
         return;
     } else {

         $.ajax({
                 url: '../../../api/patient/update-physician',
                 method: 'PUT',
                 headers: {
                     contentType: 'application/json',
                     authorization: `Bearer ${localStorage.getItem("token")}`
                 },
                 data: { physician_email: selectedPhysician },
                 dataType: 'json'
             })
             .done(function(data, textStatus, jqXHR) {
                 if (jqXHR.status == 200) {
                     alert(JSON.stringify(data.message))
                     getUserInfo()

                 } else {
                     alert(JSON.stringify(data.responseJSON.error))
                 }
             })
             .fail(function(data, textStatus, jqXHR) {

                 alert(JSON.stringify(data.responseJSON.error))


             });
     }
 });

 $("#newdeviceForm").submit(function(event) {

     event.preventDefault();
     let newdeviceId = $('#Newdevice_id').val()

     if (newdeviceId === "") {
         window.alert("Invalid Device ID!")
         return;
     } else {

         $.ajax({
                 url: '../../../api/patient/add-device',
                 method: 'POST',
                 headers: {
                     contentType: 'application/json',
                     authorization: `Bearer ${localStorage.getItem("token")}`
                 },
                 data: { device_id: newdeviceId },
                 dataType: 'json'
             })
             .done(function(data, textStatus, jqXHR) {
                 if (jqXHR.status == 200) {
                     alert(JSON.stringify(data.message))
                     getDeviceList()

                 } else {
                     alert(JSON.stringify(data.responseJSON.error))
                 }
             })
             .fail(function(data, textStatus, jqXHR) {

                 alert(JSON.stringify(data.responseJSON.error))


             });
     }
 });

 $("#myInfoForm").submit(function(event) {

     event.preventDefault();

     if ($('#firstName').val() === "") {
         window.alert("Invalid First Name!");
         return;
     }
     if ($('#lastName').val() === "") {
         window.alert("Invalid Last Name!");
         return;
     }
     var userData = {
         firstName: $('#firstName').val(),
         lastName: $('#lastName').val()
     }

     $.ajax({
             url: '../../../api/patient/update-user-info',
             method: 'PUT',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             data: userData,
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {
             if (jqXHR.status == 200) {
                 alert(JSON.stringify(data.message))
                 getUserInfo()

             } else {
                 alert(JSON.stringify(data.responseJSON.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {
             alert(JSON.stringify(data.responseJSON.error))


         });

 });



 function getWeeklyReport() {
     $.ajax({
             url: '../../../api/patient/weekly-summary',
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) {
                 const today = new Date()
                 const yesterday = new Date(today.getTime())
                 const sevenDaysAgo = new Date(today.getTime())
                 yesterday.setDate(today.getDate() - 1)
                 sevenDaysAgo.setDate(today.getDate() - 7)
                 $('#minRate').html(`${data.min} BPM`)
                 $('#maxRate').html(`${data.max} BPM`)
                 $('#avgRate').html(`${data.avg.toFixed(2)} BPM`)
                 $('#wReportDate').html(`
                  From ${sevenDaysAgo.getMonth()+1}/${sevenDaysAgo.getDate()}/${sevenDaysAgo.getFullYear()}
                 To ${yesterday.getMonth()+1}/${yesterday.getDate()}/${yesterday.getFullYear()}  
                 `)

             } else {
                 alert(JSON.stringify(data.error))
             }
         })
         .fail(function(data, textStatus, jqXHR) {

             alert(JSON.stringify(data.responseJSON.error))

         });
 }

 function getDailyReport() {
     $.ajax({
             url: '../../../api/patient/daily-summary',
             method: 'GET',
             headers: {
                 contentType: 'application/json',
                 authorization: `Bearer ${localStorage.getItem("token")}`
             },
             data: { "selectedDate": "12/01/2022", "email": localStorage.getItem("userEmail") },
             dataType: 'json'
         })
         .done(function(data, textStatus, jqXHR) {

             if (jqXHR.status == 200) {

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

 function graphBgColor(length) {
     let bgColor = []
     for (let i = 0; i < length; i++)
         bgColor.push('rgba(153, 102, 255)')
     return bgColor
 }
 getWeeklyReport()
 getDailyReport()
 getDeviceList()
 getUserInfo()