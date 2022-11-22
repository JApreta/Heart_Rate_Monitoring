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

 //  $(function() {

 //      $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
 //          localStorage.setItem('lastTab', $(this).attr('href'));
 //      });
 //      var lastTab = localStorage.getItem('lastTab');

 //      if (lastTab) {
 //          $('[href="' + lastTab + '"]').tab('show');
 //      }

 //  });
 getDeviceList()
 getUserInfo()