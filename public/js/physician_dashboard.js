var patientsList
var patientDevice
var patientReadings

// loads in all patients for the physician upon entering the dashboard
function setupDashboard(){
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
        if (jqXHR.status == 200){
            getPatientList();
            getPatientDevice();
            // puts all of the physician's patients into the dropdown selects
            let selectPatientList = '<option selected disabled value="">Choose the Patient to view</option>'
            for (let i = 0; i < patientsList.length; i++) {
                selectPatientList += `<option value="${patientsList[i].email}">${patientsList[i].firstName} ${patientsList[i].lastName}</option>`
            }
            $('#patientList').html(selectPatientList)
        }
        else{
            alert(JSON.stringify(data.error))
        }
    })
    .fail(function(data, textStatus, jqXHR){
        alert(JSON.stringify(data.responseJSON.error))
    });
}

// gets the physician's list of patients from the database, stores the list of patients in patientsList
function getPatientList() {
    $.ajax({
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

// gets each patients' device(s) from the database, stores the list of patient devices in patientDevice
function getPatientDevice() {
    for(let i = 0; i < patientsList.length; i++){
        $.ajax({
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

// goes through each patient and gets all of the patient's readings, stores all the patient readings in patientReadings
function getPatientReadings() {
    for(let i = 0; i < patientsList.length; i++){ // gets readings for each patient
        let tempPatientReading = [];
        for(let j = 0; j < patientDevice[i].length; j++){ // gets readings for each device (of the patient)
            $.ajax({
                url: `../../../api/physician/patient-reading/${patientDevice[i][j].device_id}`,
                method: 'GET',
                headers: {
                    contentType: 'application/json',
                    authorization: `Bearer ${localStorage.getItem("token")}`
                },
                dataType: 'json'
            })
            .done(function(data, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    tempPatientReading.push(data);
                } else {
                    alert(JSON.stringify(data.error));
                }
            })
            .fail(function(data, textStatus, jqXHR) {
                alert(JSON.stringify(data.responseJSON.error));
            });
        }
        patientReadings.push(tempPatientReading);
    }
}

// calculates average heart rate in the past 7 days
function calcAvg(readings){
    let avg = 0;
    let count = 0;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for(let i = 0; i < readings.length; i++){
        for(let j = 0; j < readings[i].length; j++){
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for(let i = 0; i < allReadings.length; i++){
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

        // if reading date is within last 7 days, use in average calcualtion
        if((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())){
            avg = avg + allReadings[i].Rate;
            count = count + 1;
        }
    }
    return avg/count;
}

// calculates max heart rate in the past 7 days
function calcMax(readings){
    let flag = 0;
    let max = -1;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for(let i = 0; i < readings.length; i++){
        for(let j = 0; j < readings[i].length; j++){
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for(let i = 0; i < allReadings.length; i++){
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

         // if reading date is within last 7 days, use in max calcualtion
        if((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())){
            if(flag == 0){ // first reading is set to max
                max = allReadings[i].Rate;
                flag = 1;
            }
            else{
                if(max < allReadings[i].Rate){
                    max = allReadings[i].Rate;
                }
            }
        }
    }
    return max;
}

// calculates min heart rate in the past 7 days
function calcMin(readings){
    let flag = 0;
    let min = -1;
    let allReadings = []

    // iterate through readings for each device and add all readings to one list
    for(let i = 0; i < readings.length; i++){
        for(let j = 0; j < readings[i].length; j++){
            allReadings.push(readings[i][j]);
        }
    }

    // set current date and date 7 days ago
    let curDate = new Date();
    let lastDate = new Date(curDate.getTime());
    lastDate.setDate(curDate.getDate() - 7);

    for(let i = 0; i < allReadings.length; i++){
        // create date object using the reading's date
        let reading = allReadings[i].Date.split("/");
        let readingDate = new Date();
        readingDate.setMonth(int(reading[0]) - 1);
        readingDate.setDate(reading[1]);
        readingDate.setFullYear(reading[2]);

         // if reading date is within last 7 days, use in min calcualtion
        if((readingDate.getTime() <= curDate.getTime()) && (readingDate.getTime() >= lastDate.getTime())){
            if(flag == 0){ // first reading is set to min
                min = allReadings[i].Rate;
                flag = 1;
            }
            else{
                if(min > allReadings[i].Rate){
                    min = allReadings[i].Rate;
                }
            }
        }
    }
    return min;
}

// displays all patients
$("#displayAllPatients").click(function(event){
    event.preventDefault();
    getPatientReadings();
    let patientListInfo = `<h3>Patient List</h3><table class="table">
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
    if(patientsList.length > 0){
        for (let i = 0; i < patientsList.length; i++){
            let avg = calcAvg(patientReadings[i]);
            let max = calcMax(patientReadings[i]);
            let min = calcMin(patientReadings[i]);
            patientListInfo += ` <tr>
                                    <th scope="row">${i+1}</th>
                                        <td>${patientsList[i].firstName} + " " + ${patientsList[i].lastName}</td>
                                        <td>${avg}</td>
                                        <td>${max}</td>
                                        <td>${min}</td>
                                    </tr>`
        }
        patientListInfo += ` </tbody></table>`
        $('#patientListInfo').html(patientListInfo)
        }
        else {
            $('#patientListInfo').html('<h3>Your Patient List is Empty</h3>')
        }
});

// handles form submissin to update the measurment frequency
$("measurFreq").submit(function(event) {
    event.preventDefault();

    if ($('#betweenMeas').val() === "") { //check if an input was given
        window.alert("invalid Frequency value!");
        return;
    }

    var userData = { //get the freq value and the user email to be updated
        arg: { "delayokay": $('#betweenMeas').val() },
        email: $("patientListSummary").find(":selected").val()
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

// displays patient summary when the patient is selected in the dropdown
$("#getPatientSummary").change(function(event){
    let patient_email = $("patientListSummary").find(":selected").val();
    $.ajax({
        url: `../../../api/physician/patientSummary/${patient_email}`,
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
            // update html displayed based on patient details
            $("#patientSummaryHeader").text(`Patient ${data.name} Summary`)
            $("#minRate").html(`${data.min} BPM`)
            $("#maxRate").html(`${data.max} BPM`)
            $("#avgRate").html(`${data.avg.toFixed(2)} BPM`)
            $("#wReportDate").html(`
             From ${sevenDaysAgo.getMonth()+1}/${sevenDaysAgo.getDate()}/${sevenDaysAgo.getFullYear()}
            To ${yesterday.getMonth()+1}/${yesterday.getDate()}/${yesterday.getFullYear()}  
            `)
        }
        else{
            alert(JSON.stringify(data.error))
        }
    })
    .fail(function(data, textStatus, jqXHR) {
        alert(JSON.stringify(data.responseJSON.error))
    });
});

// displays patient detail when the patient is selected in the dropdown
$("#getPatientDetail").change(function(event){
    let patient_email = $("patientListDetail").find(":selected").val();
    $.ajax({
            url: `../../../api/physician/patientDetail/${patient_email}`,
            method: 'GET',
            headers: {
                contentType: 'application/json',
                authorization: `Bearer ${localStorage.getItem("token")}`
            },
            data: { "selectedDate": "12/01/2022", "email": patient_email },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                $("#patientDetailHeader").text(`Patient ${data.name} Detail`)
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

            } else{
                alert(JSON.stringify(data.error))
            }
        })
        .fail(function(data, textStatus, jqXHR){
            alert(JSON.stringify(data.responseJSON.error))
        });
});

function graphBgColor(length) {
    let bgColor = []
    for (let i = 0; i < length; i++)
        bgColor.push('rgba(153, 102, 255)')
    return bgColor
}

$(function () { // redirects to index page when physician clicks logout - need to implement actual logout
    $('a#logout').click(function () {
      var url = this.href;
      window.location.href = "../index.html";
    });
});
