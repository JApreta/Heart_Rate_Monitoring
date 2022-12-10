var patientsList
var patientDevice
var patientReadings

// loads in all patients for the physician upon entering the dashboard
function setupDashboard() {

    $.ajax({
            url: '../../../api/physician/dashboard',
            method: 'GET',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            dataType: 'json'
        })
        .done(async function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                getPatientList(); //load the phyician list
                // puts all of the physician's patients into the dropdown 
                $('#email').val(data.email) //show the user's email
                $('#firstName').val(data.firstName) //show the user's 1st name
                $('#lastName').val(data.lastName) //shpw the user last name
                let selectPatientList = '<option selected disabled value="">Choose the Patient to view</option>'
                for (let i = 0; i < patientsList.length; i++) {
                    selectPatientList += `<option value="${patientsList[i].email}">${patientsList[i].firstName} ${patientsList[i].lastName}</option>`
                }
                $('#getPatientSummary').html(selectPatientList) //load and display patient list option for weekly sumarry view
                $('#getPatientDetail').html(selectPatientList) //load and display patirnt list option for dauliy summury view
            } else {
                alert(JSON.stringify(data.error))
            }
        })
        .fail(function(data, textStatus, jqXHR) {
            alert(JSON.stringify(data.responseJSON.error))
        });
}

// gets the physician's list of patients from the database, stores the list of patients in patientsList
async function getPatientList() {
    await $.ajax({
            async: false,
            url: '../../../api/physician/patient-list',
            method: 'GET',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                patientsList = data;
            } else {
                alert(JSON.stringify(data.error));
            }
        })
        .fail(function(data, textStatus, jqXHR) {
            alert(JSON.stringify(data.responseJSON.error));
        });
}


// goes through each patient and gets all of the patient's readings, stores all the patient readings in patientReadings
function getPatientReadings() {
    patientReadings = [] //clear previous list
    for (let i = 0; i < patientsList.length; i++) { // gets readings for each patient
        $.ajax({
                async: false,
                url: `../../../api/physician/patientSummary`,
                method: 'GET',
                headers: {
                    contentType: 'application/json',
                    authorization: `Bearer ${localStorage.getItem("token")}`
                },
                data: { "email": patientsList[i].email },
                dataType: 'json'
            })
            .done(function(data, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    patientReadings.push(data);
                } else {
                    alert(JSON.stringify(data.error));
                }
            })
            .fail(function(data, textStatus, jqXHR) {
                alert(JSON.stringify(data.responseJSON.error));
            });
    }
}

// displays all patients
$("#displayAllPatients").click(function(event) {

    getPatientReadings();

    let patientListInfo = `<h3>All Patients</h3><table class="table">
                               <thead>
                                   <tr>
                                       <th scope="col">#</th>
                                       <th scope="col">Name</th>
                                       <th scope="col">7-Day Average Heart Rate</th>
                                       <th scope="col">Maximum Heart Rate</th>
                                       <th scope="col">Minimum Heart Rate</th>
                                   </tr>
                               </thead>
                               <tbody>`
    if (patientsList.length > 0) {
        for (let i = 0; i < patientsList.length; i++) {
            let avg = patientReadings[i].avg;
            let max = patientReadings[i].max;
            let min = patientReadings[i].min;
            patientListInfo += ` <tr>
                                    <th scope="row">${i+1}</th>
                                        <td>${patientsList[i].firstName} ${patientsList[i].lastName}</td>
                                        <td>${avg.toFixed(2)}</td>
                                        <td>${max}</td>
                                        <td>${min}</td>
                                    </tr>`
        }
        patientListInfo += ` </tbody></table>`
        $('#patientListInfo').html(patientListInfo)
    } else {
        $('#patientListInfo').html('<h3>Your Patient List is Empty</h3>')
    }
});

// handles form submissin to update the measurment frequency
$("#measurFreq").submit(function(event) {
    event.preventDefault();
    $('#loadingModal').modal('show') //show loading modal
    $('#updateMeasFreq').disabled = true //disable submit btn to avoid multiple submissions at once
    if ($('#betweenMeas').val() === "") { //check if an input was given
        window.alert("invalid Frequency value!");
        return;
    }

    var userData = { //get the freq value and the user email to be updated
        arg: JSON.stringify({ "delayokay": $('#betweenMeas').val() }),
        email: $("#getPatientSummary").find(":selected").val()
    }

    $.ajax({ // make an ajax call to server to update the freq
            url: '../../../api/physician/measurment-frequency',
            method: 'POST',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            data: userData,
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            $('#loadingModal').modal('hide')
            $('#updateMeasFreq').disabled = false
            if (jqXHR.status == 200) { // check if update was done
                alert(JSON.stringify(data.message)) // and show success message

            } else { // if failed 
                alert(JSON.stringify(data.responseJSON.error)) //show error message
            }
        })
        .fail(function(data, textStatus, jqXHR) {
            $('#loadingModal').modal('hide')
            $('#updateMeasFreq').disabled = false
            alert(JSON.stringify(data.responseJSON.error))
        });
});

// displays patient summary when the patient is selected in the dropdown
$("#getPatientSummary").change(function(event) {
    let patient_email = $("#getPatientSummary").find(":selected").val();
    //show
    $.ajax({
            url: `../../../api/physician/patientSummary`,
            method: 'GET',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            data: { "email": patient_email },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                const today = new Date()
                const yesterday = new Date(today.getTime())
                const sevenDaysAgo = new Date(today.getTime())
                yesterday.setDate(today.getDate() - 1)
                sevenDaysAgo.setDate(today.getDate() - 7)
                    // update html displayed based on patient details
                $("#patientH").html(`<i class="fa-solid fa-heart-pulse"></i>  ${data.name} Summary Report`)
                $("#minRate").html(`${data.min} BPM`)
                $("#maxRate").html(`${data.max} BPM`)
                $("#avgRate").html(`${data.avg.toFixed(2)} BPM`)
                $("#wReportDate").html(`
             From ${sevenDaysAgo.getMonth()+1}/${sevenDaysAgo.getDate()}/${sevenDaysAgo.getFullYear()}
            To ${yesterday.getMonth()+1}/${yesterday.getDate()}/${yesterday.getFullYear()}  
            `)
                $('.wreport').show()
            } else {
                alert(JSON.stringify(data.error))
            }
        })
        .fail(function(data, textStatus, jqXHR) {
            alert(JSON.stringify(data.responseJSON.error))
        });
});

// displays patient detail when the patient is selected in the dropdown
$("#choosePatientDetail").submit(function(event) {
    event.preventDefault()
    let patient_email = $("#getPatientDetail").find(":selected").val(); //get the selected patient email
    let dat = $("#readingDate").val().split('-')
    let selectedDate = `${dat[1]}/${dat[2]}/${dat[0]}`

    $.ajax({
            url: `../../../api/physician/patientDetail`,
            method: 'GET',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            data: { "selectedDate": selectedDate, "email": patient_email },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {

                $("#patientDetailHeader").text(`Patient ${data.name} Detail on ${selectedDate}`)
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
});

this

//function makes an api call to the srver to update the user 's full name
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
            url: '../../../api/physician/update-user-info', //server endpoint to update the user info
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

function graphBgColor(length) {
    let bgColor = []
    for (let i = 0; i < length; i++)
        bgColor.push('rgba(153, 102, 255)')
    return bgColor
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    $(location).attr('href', '../index.html');
}
$(function() { // redirects to index page when physician clicks logout - need to implement actual logout
    setupDashboard()
    $('.wreport').hide()
});

/*
// gets each patients' device(s) from the database, stores the list of patient devices in patientDevice
function getPatientDevice() {
    for (let i = 0; i < patientsList.length; i++) {
        $.ajax({
                async: false,
                url: `../../../api/physician/patient-device/${patientsList[i].email}`,
                method: 'GET',
                headers: {
                    contentType: 'application/json',
                    authorization: `Bearer ${localStorage.getItem("token")}`
                },
                dataType: 'json'
            })
            .done(function(data, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    patientDevice.push(data);
                } else {
                    alert(JSON.stringify(data.error));
                }
            })
            .fail(function(data, textStatus, jqXHR) {
                alert(JSON.stringify(data.responseJSON.error));
            });
    }
}


// calculates average heart rate in the past 7 days
function calcAvg(readings) {
    let avg = 0;
    let count = 0;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for (let i = 0; i < readings.length; i++) {
        for (let j = 0; j < readings[i].length; j++) {
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for (let i = 0; i < allReadings.length; i++) {
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

        // if reading date is within last 7 days, use in average calcualtion
        if ((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())) {
            avg = avg + allReadings[i].Rate;
            count = count + 1;
        }
    }
    return avg / count;
}

// calculates max heart rate in the past 7 days
function calcMax(readings) {
    let flag = 0;
    let max = -1;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for (let i = 0; i < readings.length; i++) {
        for (let j = 0; j < readings[i].length; j++) {
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for (let i = 0; i < allReadings.length; i++) {
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

        // if reading date is within last 7 days, use in max calcualtion
        if ((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())) {
            if (flag == 0) { // first reading is set to max
                max = allReadings[i].Rate;
                flag = 1;
            } else {
                if (max < allReadings[i].Rate) {
                    max = allReadings[i].Rate;
                }
            }
        }
    }
    return max;
}

// calculates min heart rate in the past 7 days
function calcMin(readings) {
    let flag = 0;
    let min = -1;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for (let i = 0; i < readings.length; i++) {
        for (let j = 0; j < readings[i].length; j++) {
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for (let i = 0; i < allReadings.length; i++) {
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

        // if reading date is within last 7 days, use in min calcualtion
        if ((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())) {
            if (flag == 0) { // first reading is set to min
                min = allReadings[i].Rate;
                flag = 1;
            } else {
                if (min > allReadings[i].Rate) {
                    min = allReadings[i].Rate;
                }
            }
        }
    }
    return min;
}
*/