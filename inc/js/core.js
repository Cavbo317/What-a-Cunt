//TODO - Continue to strip away the Gooden spaghetti and convert to a True HTML5 product

//////////////////////////////
//////Configuration Block/////
//////////////////////////////
//Standalone or nopeHosted
var isStandAlone = false;
//Has a progress requirement config
var hasConfig = true;
//Does this this course require a cert?
var hasCert = true;

//Has the course menu been completed once already?
var courseMenuComplete = false;

//////////////////////////////
//////Dynamic Vars////////////
//////////////////////////////
// Variables for product to send to a database and the certificate
var productTitle = "";
var productCourseNumber = "";
var productCompletionUpdated = false;
var catalog = true; // CHG 001
var courseID = "";
var unlockMenu = true;
var courseReset = false;
var nextSCO = "";
var scoGroup = undefined; //The current sco group
var lastGroup = "";
var attemptCount = 0;

// Variables used to send student information to a database and the certificate
var studentFirstName = "";
var studentMiddleName = "";
var studentLastName = "";
var studentEmail = "";
var studentCompletionStatus = "incomplete";
var studentID = "";
var userId = "";  //this variable needs to be set to 32 for debugging purposes on standalone versions of courses otherwise it should be null

// Variables used for a SCO
var strScoID = "";
var strScoTitle = "";
var strScoHREF = "";
var strScoCompletionThreshold = "";
var strScoTimeLimitAction = "";
var strScoDataFromLMS = "";
var strScoAttemptLimit = "";
var strScoAttemtDurationLimit = "";
var strScoSatisfiedByMeasure = "";
var strScoMinNormalizedMeasure = "";
var strScoAPI = "";

// SCO data is loaded from menu.html ajax and pushed into this array
var loadedSCO = [];

// Used for Course Completion Validation
var completedSCO = [];
var requiredSCO = [];
var satisfyArr = [];
var completeScoGroups = [];
var failedSCO = [];

//used for course survey
var hasPreSurvey = true;
var hasPostSurvey = true;
var isPreSurveyRequired = false;
var isPostSurveyRequired = false;
var surveyCompleted = "";

// SCO Functions
function buildScoAPI(scoID) {
    for (var i = 0; i < loadedSCO.length; i++) {
        //Check all loadedSCO indexes with .name key
        if (loadedSCO[i].name == scoID) {
            strScoID = loadedSCO[i][0];	// identifier
            strScoTitle = loadedSCO[i][1];	// title
            strScoHREF = loadedSCO[i][2];	// href
            strScoCompletionThreshold = loadedSCO[i][3];	// completionThreshold
            strScoTimeLimitAction = loadedSCO[i][4];	// timeLimitAction
            strScoDataFromLMS = loadedSCO[i][5];	// dataFromLMS
            strScoAttemptLimit = loadedSCO[i][6];	// attemptLimit
            strScoAttemtDurationLimit = loadedSCO[i][7];	// attemtDurationLimit
            strScoSatisfiedByMeasure = loadedSCO[i][8];	// satisfiedByMeasure
            strScoMinNormalizedMeasure = loadedSCO[i][9];	// minNormalizedMeasure
            strScoAPI = strScoID + "API";
        }
    }
    try {
        if (eval(strScoAPI).getScoID() != "") {
            // Do nothing as ScoAPI is already created
        }
    }
    //The grammer from standalone 1.0 is on point...
    catch (objectDontExist) {
        tempString = strScoAPI + " = new apiScoStructure(\"" + strScoID + "\",\"" + strScoTitle.toString() + "\",\"" + strScoHREF + "\")";
        eval(tempString);
        eval(strScoAPI).SetLMSContent("objectives", "PRIMARYOBJ");
        if (strScoCompletionThreshold != "null") { eval(strScoAPI).SetLMSContent("completion_threshhold", strScoCompletionThreshold); };
        if (strScoTimeLimitAction != "null") { eval(strScoAPI).SetLMSContent("time_limit_action", strScoTimeLimitAction); };
        if (strScoDataFromLMS != "null") { eval(strScoAPI).SetLMSContent("launch_data", strScoDataFromLMS); };
        if (strScoAttemtDurationLimit != "null") { eval(strScoAPI).SetLMSContent("max_time_allowed", strScoAttemtDurationLimit); };
        if (strScoSatisfiedByMeasure == "true" && strScoMinNormalizedMeasure != "null") { eval(strScoAPI).SetLMSContent("scaled_passing_score", strScoMinNormalizedMeasure); };
    }
    return true;
}

function launchSCO(scoID) {
    idScoToLoad = scoID;
    frames["Content"].location.replace("Content.html");
    return true;
}

function loadSCO() {
    var strScoAPI = "";
    if (idScoActive != "") {
        strScoAPI = idScoActive + "API";
        eval(strScoAPI).ResetInitializeState();
    }
    idScoActive = idScoToLoad;
    strScoAPI = idScoActive + "API";
    idScoToLoad = "";
    frames["Content"].location.replace(contentPath + eval(strScoAPI).getScoHREF());
}

function terminateSCO(scoID, scoCompletionStatus) {
    updateProductMenu(scoID, scoCompletionStatus);
    lastGroup = scoGroup;
    checkCompletion();
    updateDatabase();
}

function updateProductMenu(scoID, scoCompletionStatus) {
    document.getElementById('Menu').contentWindow.updateMenu(scoID, scoCompletionStatus);
}

//TODO - Make a more intelligent Certificate/Completion stuff....
function checkCompletion() {
    if (isStandAlone == false) {
        if (hasConfig == true && scoGroup !== undefined) {
            //The average lifespan of a Male Orangutan in the wild is 30 to 40 years
            var k = 0;
            var scoGroups = satisfyArr[0][scoGroup];

            for (var i = 0; i < scoGroups.length; i++) {
                var $scoGroup = scoGroups[i];

                for (var x = 0; x < completedSCO.length; x++) {
                    var sco = completedSCO[x];

                    if ($.inArray(sco, $scoGroup) !== -1) { //Is in array....
                        lastGroup = scoGroup;
                        k++;

                        if (k == $scoGroup.length) {
                            k = 0;
                            if ($.inArray(scoGroup, completeScoGroups) == -1) {
                                completeScoGroups.push(scoGroup);
                                completeScoGroups.sort();
                                //Complete whole lesson if one group is satisfied
                                document.getElementById('Menu').contentWindow.updateMenu(scoGroup, "scoGroup");
                                //If the course is completed
                                var isComplete = compareComplete(requiredSCO, completeScoGroups);

                                if (isComplete == true && courseMenuComplete == false) {
                                    //Set studentCompletionStatus to completed
                                    if ((isPreSurveyRequired == true && findItem("presurvey")) || isPreSurveyRequired == false) {
                                        updateStudentStatus();
                                        courseMenuComplete = true;
                                        //Unlock the certificate menu item in Menu.html
                                        if (hasCert == true) {
                                            document.getElementById('Menu').contentWindow.minimizeLessons();
                                            if (isPostSurveyRequired == true && (findItem("postsurvey") == false)) {
                                                document.getElementById('Menu').contentWindow.allowPostSurvey();
                                                alert("Course completed.  Please take the Post Survey before printing your certificate.")
                                            } else {
                                                getCertificateDetails();
                                                document.getElementById('Menu').contentWindow.allowCertificate();
                                                document.getElementById('Menu').contentWindow.allowPostSurvey();
                                                alert("Course completed. You may now click Print Certificate");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (hasConfig == false) {
            //loadedSCO will never contain presurvey or postsurvey because they are not scos and are not recognized by the SCORM API
            //We must manually find out if the user completed the presurvey/postsurvey in order to allow a certificate
            //When config is false the survey's are NOT mandatory, therefore we allow the certificate whether or not they completed the surveys
            //This becomes a problem when storing WHEN they actually completed the survey, this will check all instances to see if they did or did not
            //and allow certificate whether they did or didn't, but we still have to keep the survey's in the completed sco for Database tracking
            if (findItem("presurvey")) {
                if (loadedSCO.length == (completedSCO.length - 1)) {
                    //Set studentCompletionStatus to completed
                    updateStudentStatus();
                    //Unlock the certificate menu item in Menu.html
                    if (hasCert == true) {
                        courseCompleted();
                    }
                } else if (findItem("postsurvey")) {
                    if (loadedSCO.length == (completedSCO.length - 2)) {
                        updateStudentStatus();
                        if (hasCert == true) {
                            courseCompleted();
                        }
                    }
                }
            } else {
                if (loadedSCO.length == (completedSCO.length)) {
                    //Set studentCompletionStatus to completed
                    updateStudentStatus();
                    //Unlock the certificate menu item in Menu.html
                    if (hasCert == true) {
                        courseCompleted();
                    }
                }
            }
        }
    }
}

function courseCompleted() {
    getCertificateDetails();
    document.getElementById('Menu').contentWindow.allowCertificate();
    document.getElementById('Menu').contentWindow.allowPostSurvey();
    document.getElementById('Menu').contentWindow.minimizeLessons();
    //alert("Course completed. You may now click Print Certificate");
}

function findItem(item) {
    for (var i = 0; i < completedSCO.length; i++) {
        if (completedSCO[i].toString().toLowerCase() == item) {
            return true;
        }
    }
    return false;
}

function compareArray(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

function compareComplete(arr1, arr2) {

    var inArray = 0;

    for (var i = 0; i < arr1.length; i++) {
        for (j = 0; j < arr2.length; j++) {
            if (arr1[i] == arr2[j]) {
                inArray++;
            }
        }
    }

    if (inArray == arr1.length) {
        return true;
    }

}


//Decode the URL Using regex - we use this to get userId when this is not a standalone
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(window.parent.location);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function updateStudentStatus() {
    studentCompletionStatus = "completed";
    // Update database
    updateDatabase();
    productCompletionUpdated = true;
}

// Update Database
function updateDatabase() {
    if (isStandAlone == false) {
        //Store progress - Even if course is completed
        try {
            if (studentID != "" && studentID != "NonUser" && studentID != "nopeqa" && failedSCO.toString() != "") {
                $.ajax({
                    type: "POST",
                    url: "Data.aspx/submitCourseFail",
                    data: '{studentID: "' + studentID + '", courseID: "' + courseID + '", scosComplete: "' + completedSCO.toString() + '", scosFailed: "' + failedSCO.toString() + '"}',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                    },
                    failure: function (response) {
                        alert(response.d);
                    },
                    error: function (response) {
                        alert("Error Updating Progress: Maybe There Is No Internet Connection? Ignore This If Running Offline : Update Progress With Fails Has Failed")
                    }
                });
            } else if (studentID != "" && studentID != "NonUser" && studentID != "nopeqa" && completedSCO.toString() != "") {
                $.ajax({
                    type: "POST",
                    url: "Data.aspx/submitCourse",
                    data: '{studentID: "' + studentID + '", courseID: "' + courseID + '", scosComplete: "' + completedSCO.toString() + '"}',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                    },
                    failure: function (response) {
                        alert(response.d);
                    },
                    error: function (response) {
                        alert("Error Updating Progress: Maybe There Is No Internet Connection? Ignore This If Running Offline : Update Progress with no Fails Has Failed")
                    }
                });
            }
        }
        catch (exception) {
            // No internet available - Do nothing to bypass error
        }
    }
    if (isStandAlone == false && studentCompletionStatus == "completed" && productCompletionUpdated == false) {
        //Send course to Completion table
        try {
            if (studentID != "" && studentID != "NonUser" && studentID != "nopeqa" && completedSCO.toString() != "") {
                $.ajax({
                    type: "POST",
                    url: "Data.aspx/completeCourse",
                    data: '{studentID: "' + studentID + '", courseID: "' + courseID + '"}',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                        productCompletionUpdated = true;
                    },
                    failure: function (response) {
                        alert(response.d);
                    },
                    error: function (response) {
                        alert("Error Updating Completion: Maybe There Is No Internet Connection? Ignore This If Running Offline : Update Completion Has Failed")
                    }
                });
            }
        }
        catch (exception) {
            // No internet available - Do nothing to bypass error
        }
    }
}

// onUnload - Sends student information to database
function _onUnload() {
    try {
        updateDatabase();
    }
    catch (exception) {
        // No internet available - Do nothing to bypass error
    }
}

function getDetails() {
    //If we are not on a standalone environment
    if (isStandAlone == false) {
        //If the student is really a student
        //userId = "32";  //this line is used for debugging on standalone versions of courses. Uncomment this line in order to debug
        if (userId != "") {
            $.ajax({
                type: "POST",
                url: "Data.aspx/getDetails",
                data: '{userId: "' + userId + '" }',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                dataFilter: function (data) {
                    //We have to mess with d and return our string - because asp.net 3.0 + adds a layer of security to prevent nasty exploits
                    var msg = eval('(' + data + ')');

                    if (msg.hasOwnProperty('d'))
                        return msg.d;
                    else
                        return msg;
                },
                success: function (msg) {
                    onDetailsSuccess(msg);
                },
                failure: function (msg) {
                    alert("Failed to retrieve data");
                    alert(msg);
                }
            });
        }
        else {

            alert("Error Retrieving Details. Is this course configured for Stand Alone use? Disabling progress saving. You may continue however no progress will be saved.");
            isStandAlone = true;
            var menuButton = top.frames["Header"].document.getElementById("menuButton");
            unlockMenu = true;
            $(menuButton).trigger('click');
            forceWelcome();
            document.getElementById("Menu").contentWindow.unlockCourse();
        }
    }
}

function onDetailsSuccess(userID) {
    studentID = userID;
    var menuButton = top.frames["Header"].document.getElementById("menuButton");
    unlockMenu = true;
    $(menuButton).trigger('click');
    getCompletionDetials();
}

function getCompletionDetials() {
    if (isStandAlone == false) {
        if (studentID != "" && studentID != "nopeqa" && courseID != "" && studentID != "NonUser") {
            //Start ajax call to load previous attempt details
            $.ajax({
                type: "POST",
                url: "Data.aspx/getCourseDetails",
                data: '{studentID: "' + studentID + '", courseID: "' + courseID + '"}',
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                dataFilter: function (data) {
                    var msg = eval('(' + data + ')');

                    if (msg.hasOwnProperty('d'))
                        return msg.d;
                    else
                        return msg;
                },
                success: function (msg) {
                    onCompletionDetailsSuccess(msg);
                },
                error: function (msg) {
                    alert("There is an error");
                },
                failure: function (msg) {
                    alert("Failed to retrieve data");
                    alert(msg);
                }
            });
        }
        if (studentID != "" && studentID != "nopeqa" && courseID != "" && studentID != "NonUser") {
            //Start ajax call to load previous attempt details
            $.ajax({
                type: "POST",
                url: "Data.aspx/getFailDetails",
                data: '{studentID: "' + studentID + '", courseID: "' + courseID + '"}',
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                dataFilter: function (data) {
                    var msg = eval('(' + data + ')');

                    if (msg.hasOwnProperty('d'))
                        return msg.d;
                    else
                        return msg;
                },
                success: function (msg) {
                    onFailDetailsSuccess(msg);
                },
                error: function (msg) {
                    alert("There is an error");
                },
                failure: function (msg) {
                    alert("Failed to retrieve data");
                    alert(msg);
                }
            });
        }
    }
}

function onCompletionDetailsSuccess(scoList) {
    if (isStandAlone == false) {
        var scos = scoList.toString();
        if (scos == "NA") {
            //We dont wan't to push invalid characters to the completedSCO array
            frames["Content"].location = "welcome.html";
        } else {
            var scosComp = scos.split(',');
            if (courseReset == false) {
                for (i = 0; i < scosComp.length; i++) {
                    completedSCO.push(scosComp[i]);
                }
            } else {
                //Do nothing we have 0 scos complete due to reset
            }
            frames["Content"].location = "welcome.html";
            updateCourseMenu();
        }
        frames["Content"].location = "welcome.html";
    }
    checkCompletion();
}

function onFailDetailsSuccess(scoList) {
    if (isStandAlone == false) {
        var scos = scoList.toString();
        if (scos == "NA") {
            //We dont wan't to push invalid characters to the completedSCO array
            //frames["Content"].location = "welcome.html";
        } else {
            var scosFailed = scos.split(',');
            if (courseReset == false) {
                for (i = 0; i < scosFailed.length; i++) {
                    failedSCO.push(scosFailed[i]);
                }
            } else {
                //Do nothing we have 0 scos complete due to reset
            }
            //frames["Content"].location = "welcome.html";
            updateCourseMenu();
        }
        //frames["Content"].location = "welcome.html";
    }
}



function getCertificateDetails() {
    if (isStandAlone == false) {
        if (courseID != "" && studentID != "NonUser") {
            $.ajax({
                type: "POST",
                url: "Data.aspx/getCertificateDetails",
                data: '{studentID: "' + studentID + '" }',
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                dataFilter: function (data) {
                    //We have to mess with d and return our string - because asp.net 3.0 + adds a layer of security to prevent nasty exploits
                    var msg = eval('(' + data + ')');

                    if (msg.hasOwnProperty('d'))
                        return msg.d;
                    else
                        return msg;
                },
                success: function (msg) {
                    onCertDetailsSuccess(msg);
                },
                failure: function (msg) {
                    alert("Failed to retrieve data");
                    alert(msg);
                }
            });
        }
        else {
            alert("Error retrieving student details. Are you connected to the internet?");
        }
    }
}

function updateSurveyDetails(data, survey) {
    isStandAlone == !1 && (courseID != "" && studentID != "NonUser" ? $.ajax({
        type: "POST",
        url: "Data.aspx/updatePreSurveyDetails",
        traditional: true,
        data: JSON.stringify({ studentID: studentID, courseID: courseID, myData: data, surveyType: survey }),
        contentType: "application/json; charset=utf-8",
        dataFilter: function (data) {
            //alert(data);
            var msg = eval("(" + data + ")");
            return msg.hasOwnProperty("d") ? msg.d : msg
        },
        success: function (msg) {
            onSurveyDetailsSuccess(survey)
        },
        error: function (jqXHR, textStatus, exception) {
            //alert("jqXHR: " + jqXHR.status + " exception: " + exception + " textStatus: " + textStatus)
            alert("There is an error")
        },
        failure: function (msg) {
            alert("Failed to Post Survey");
            alert(msg)
        }
    }) : alert("Error reporting survey"))
}

function checkObjTable(objArray) {
    var objArr = objArray;
    if (isStandAlone == false) {
        if (courseID != "" && studentID != "NonUser") {
            $.ajax({
                type: "POST",
                url: "Data.aspx/checkObjTable",
                data: JSON.stringify({ courseID: courseID, objectiveArray: objArr }),
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                dataFilter: function (data) {
                    var msg = eval("(" + data + ")");
                    return msg.hasOwnProperty("d") ? msg.d : msg
                },
                success: function (msg) {
                    //alert(msg);
                },
                failure: function (msg) {
                    alert("Failed check on questTable");
                    alert(n);
                }
            });
        }
        else {
            alert("error checking question table")
        }
    }
}


function onSurveyDetailsSuccess(survey) {
    //Once user completes a survey it'll store store the completion in the progress database   
    if (survey == "postsurvey" && hasCert == true && isPostSurveyRequired == true) {
        getCertificateDetails();
        document.getElementById('Menu').contentWindow.allowCertificate();
        //alert("Course completed. You may now click Print Certificate");
    }
    else if (survey == "presurvey" && isPreSurveyRequired == true) {
        document.getElementById("Menu").contentWindow.unlockCourse();
    }
    updateProductMenu(survey, "completed");
    updateDatabase();
}

function onCertDetailsSuccess(studentInfo) {
    if (isStandAlone == false) {
        var studentData = studentInfo.toString();
        var studentArray = studentData.split(',');
        studentFirstName = studentArray[0];
        studentMiddleName = studentArray[1];
        studentLastName = studentArray[2];
    }
}

function loadCertificate() {
    if (isStandAlone == false) {
        frames["Content"].location.replace("Certificate.html");
        alert("Right Click And Select Print To Save Certificate");
    }
}

function loadPreSurvey() {
    //only if the course is connected will a pre or post survey be active
    if (isStandAlone == false) {
        frames.Content.location.replace("presurvey.html");
        document.getElementsByName("Content")[0].contentWindow.document.body.focus();
        alert("Please complete the following survey to take the course.");
    }
}

function loadPostSurvey() {
    if (isStandAlone == false) {
        frames.Content.location.replace("postsurvey.html");
        document.getElementsByName("Content")[0].contentWindow.document.body.focus();
    }
}

function updateCourseMenu() {
    for (var i = 0; i < completedSCO.length; i++) {
        document.getElementById('Menu').contentWindow.updateMenu(completedSCO[i].toString(), "completed");

    }
    if (failedSCO.toString() != "") {
        for (var j = 0; j < failedSCO.length; j++) {
            document.getElementById('Menu').contentWindow.updateMenu(failedSCO[j].toString(), "failed");

        }
    }
}

function setUserID() {
    userId = window.opener.userId
}

function surveyComplete(surveyComplete) {
    surveyCompleted = surveyComplete;
    $('#Content').attr('src', 'surveyComplete.html');
}

function forceWelcome() {
    $('#Content').attr('src', 'welcome.html');
}

function enterDownloadData(sA) {
    var organization,
        reason;
    //Break apart serialized array for betting database storage
    $.each(sA, function (i, field) {
        switch (field.name) {
            case "organization":
                organization = field.value;
                break;
            case "reason":
                reason = field.value;
                break;
        }
    });

    //Post data to the database for tracking of who and why they downloaded a video
    $.ajax({
        type: "POST",
        url: "Data.aspx/updateDownloadData",
        data: '{studentID: "' + studentID + '", courseID: "' + courseID + '", organization: "' + organization + '", reason: "' + reason + '"}',
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        dataFilter: function (data) {
            var msg = eval("(" + data + ")");
            return msg.hasOwnProperty("d") ? msg.d : msg
        },
        success: function (n) {
            //alert("save to database!");
        },
        error: function () {
            alert("There is an error")
        },
    })
}