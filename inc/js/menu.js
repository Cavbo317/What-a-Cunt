function updateMenu(scoID, scoCompletionStatus) {

    switch (scoCompletionStatus) {
        case "incomplete":
            $('#sco[data-sco="' + scoID + '"]').css({ "background": "url(inc/img/prog.png) no-repeat 5% 0%;" });
            if (window.parent.hasConfig == true) {
                if (window.parent.attemptCount > 0) {
                    window.parent.attemptCount--;
                    $('#sco[data-sco="' + scoID + '"]').attr("data-attempt", window.parent.attemptCount.toString());
                }
                //disable this SCO from any future attempt / set it as a failed sco
                if (window.parent.attemptCount == 0) {
                    $('#sco[data-sco="' + scoID + '"]').attr("data-attempt", "0");
                    $('#sco[data-sco="' + scoID + '"]').css({ "background": "url(inc/img/fail.png) no-repeat 5% 0%;" });
                    $('#sco[data-sco="' + scoID + '"]').prop('disabled', true);
                    window.parent.failedSCO.push(scoID);
                }
            }
            break;

        case "completed":
            if (scoID == "presurvey") {
                updateMenu(null, "presurvey");
            }
            if (scoID == "postsurvey") {
                updateMenu(null, "postsurvey");
            }
            $('#sco[data-sco="' + scoID + '"]').css({ "background": "url(inc/img/comp.png) no-repeat 5% 0%;" });
            //Enable previously completed SCOS
            $('#sco[data-sco="' + scoID + '"]').prop('disabled', false);
            if (window.parent.hasConfig == true) {
                window.parent.scoGroup = $('#sco[data-sco="' + scoID + '"]').attr("data-group");
                window.parent.nextSCO = $('#sco[data-sco="' + scoID + '"]').attr("data-next");
                //Enable next sco if it has a lock
                $('#sco[data-sco="' + window.parent.nextSCO + '"]').prop('disabled', false);
            }
            if ($.inArray(scoID, window.parent.completedSCO) > -1) {

            } else {
                window.parent.completedSCO.push(scoID);
            }
            window.parent.checkCompletion();
            break;

        case "presurvey":
            //$("#presurvey").attr("onclick", "alert('Thank you, you have already completed the Pre Course Survey.')");
            window.parent.surveyComplete("presurvey");
            unlockCourse();
            $("#presurvey").css({
                background: "url(inc/img/comp.png) no-repeat 5% 0%;"
            });
            break;

        case "postsurvey":
            window.parent.surveyComplete("postsurvey");
            window.parent.isPostSurveyRequired = false;
            $("#postsurvey").attr("onclick", "alert('Thank you, you have already completed the Post Course Survey.')");
            $("#postsurvey").css({
                background: "url(inc/img/comp.png) no-repeat 5% 0%;"
            });
            break;

        case "certificate":
            $('#certificate').css({ "background": "url(inc/img/comp.png) no-repeat 5% 0%;" });
            break;

        case "scoGroup":
            $('#sco[data-group="' + scoID + '"]').prop('disabled', false);
            $('#sco[data-group="' + scoID + '"]').css({ "background": "url(inc/img/comp.png) no-repeat 5% 0%;" });
            break;

        case "failed":
            $('#sco[data-sco="' + scoID + '"]').css({ "background": "url(inc/img/fail.png) no-repeat 5% 0%;" });
            $('#sco[data-sco="' + scoID + '"]').prop('disabled', true);
            $('#sco[data-sco="' + scoID + '"]').attr("data-attempt", "0");
            break;

        case "unknown":
            $('#sco[data-sco="' + scoID + '"]').css({ "background": "url(inc/img/prog.png) no-repeat 5% 0%;" });
            break;

        default:
            //DoNothing - this default is here to please Sir Master Doctor Nobleman Seargent Laughlin
            break;
    }

}

$.ajax({
    type: "GET",
    url: "../Product/imsmanifest.xml",
    dataType: "xml",
    success: function (xml) {
        //TODO remove more un needed VARS used in old stand alone IE: productCourseNumber
        //Set the courseID/productCourseNumber
        var $courseID = $(xml).find("manifest").attr("identifier");
        window.parent.courseID = $courseID;
        window.parent.productCourseNumber = $courseID;
        console.log($courseID);

        var $productTitle = $(xml).find("organization").children("title").text();
        window.parent.productTitle = $productTitle;
        $("#menu").append("<div id='prodtit'>" + $productTitle + "</div>");

        //check if there is a presurvey and add it to the menu if there is
        /*THIS MAY GO AWAY!!!!!! 
         * 
         if (window.parent.hasPreSurvey == true) {
            $("#menu").append("<div id='presurvey' data-on='0' onclick='parent.loadPreSurvey();'>Pre Course Survey<\/div>");
        }
        */
        var $productType = $(xml).find("organization").attr("identifier")
        //catch lesson titles so we don't have duplicates in the menu
        var lessons = [];
        //count for loadedSCO[i] in core.js
        var i = 0;

        //count for number of times ran through loop
        var j = 0;

        // Parse the xml file and get data        
        $(xml).find('item').each(function () {

            var $item = $(this);

            var $lesson = $item.parent('item').children('title').text();

            if ($.inArray($lesson, lessons) > -1) {
            } else {
                $("#menu").append("<div id='lesson' data-on='0' data-lesson='" + $lesson + "'>" + $lesson + "</div>");
                lessons.push($lesson);
            }

            $(xml).find('resource').each(function (j) {

                switch ($productType) {
                    case "Unity":
                        var $resc = $(this);
                        var $href = $resc.attr('href');
                        var $id = $resc.attr('identifier');
                        var $ref = $item.attr('identifierref');
                        var $scoID = $item.attr('identifier');
                        var $title = $item.children('title').text();

                        //TODO - Additional Scorm Manifest Items Not Currently Used so We Pass Defaults
                        var $threshold = "1.0";
                        var $timeLimitAction = "";
                        var $lmsData = ""
                        var $attemptLimit = "";
                        var $attemptDurationLimit = "";
                        var $statisfiedByMeasure = "false";
                        var $minNormalizedMeasure = "1.0";

                        //We want all existing elements that are not Titled "Record Progress"
                        if (($ref !== null) && ($id == $ref) && ($title !== "Record Progress")) {

                            //Push Values to Array for loadedSCO
                            var scoArray = [];
                            scoArray.push($scoID,
										  $title,
										  $href,
										  $threshold,
										  $timeLimitAction,
										  $lmsData,
										  $attemptLimit,
										  $attemptDurationLimit,
										  $statisfiedByMeasure,
										  $minNormalizedMeasure);
                            window.parent.loadedSCO.push(scoArray);


                            //Go back to loadedSCO array and name the loadedSCO[i].name as $scoID
                            window.parent.loadedSCO[i].name = $scoID;
                            i++;
                            if (($title == "Splash") || ($title == "Tutorial")) {
                                $("#menu").append("<div class='intro' id='sco' data-on='0' data-sco='" + $scoID + "' data-lesson='" + $lesson + "' data-next='' onclick=''>" + $title + "</div></ br>");
                            } else {
                                $("#menu").append("<div class='sco' id='sco' data-on='0' data-sco='" + $scoID + "' data-lesson='" + $lesson + "' data-next='' onclick=''>" + $title + "</div>");
                            }
                            return false;
                        }

                        break;

                    default:
                        if (j == i) {


                            var $resc = $(this);
                            var $href = $resc.attr('href');
                            var $id = $resc.attr('identifier');
                            var $ref = $item.attr('identifierref');
                            var $scoID = $item.attr('identifier');
                            var $title = $item.children('title').text();

                            //TODO - Additional Scorm Manifest Items Not Currently Used so We Pass Defaults
                            var $threshold = "1.0";
                            var $timeLimitAction = "";
                            var $lmsData = ""
                            var $attemptLimit = "";
                            var $attemptDurationLimit = "";
                            var $statisfiedByMeasure = "false";
                            var $minNormalizedMeasure = "1.0";



                            //We want all existing elements that are not Titled "Record Progress"
                            if (($ref !== null) && ($id == $ref) && ($title !== "Record Progress")) {

                                //Push Values to Array for loadedSCO
                                var scoArray = [];
                                scoArray.push($scoID,
                                              $title,
                                              $href,
                                              $threshold,
                                              $timeLimitAction,
                                              $lmsData,
                                              $attemptLimit,
                                              $attemptDurationLimit,
                                              $statisfiedByMeasure,
                                              $minNormalizedMeasure);
                                window.parent.loadedSCO.push(scoArray);


                                //Go back to loadedSCO array and name the loadedSCO[i].name as $scoID
                                window.parent.loadedSCO[i].name = $scoID;
                                i++;
                                if (($title == "Splash") || ($title == "Tutorial")) {
                                    $("#menu").append("<div class='intro' id='sco' data-on='0' data-sco='" + $scoID + "' data-lesson='" + $lesson + "' data-next='' onclick=''>" + $title + "</div></ br>");
                                } else {
                                    $("#menu").append("<div class='sco' id='sco' data-on='0' data-sco='" + $scoID + "' data-lesson='" + $lesson + "' data-next='' onclick=''>" + $title + "</div>");
                                }
                                return false;
                            }

                        }

                }

            });
        });

    },
    complete: function () {
        //Add a post survey button if the core.js has it enabled
        /*
         * THIS MAY GO AWAY
         * if (window.parent.hasPostSurvey == true) {
            $("#menu").append("<div id='postsurvey' data-on='0'>Post Course Survey<\/div>");
            }
         */
        
        //Add a cert button if the core.js has it enabled
        if (window.parent.hasCert == true) {
            $("#menu").append("<div id='certificate' data-on='0'>Print Certificate</div>");
        }
        loadConfig();
    }
});

function loadConfig() {
    //Run a try/catch so we don't upset the hampster.
    if (parent.hasConfig == true) {
        try {
            $.ajax({
                type: "GET",
                url: "config.xml",
                dataType: "xml",
                success: function (xml) {
                    //Parse the xml file and get SCO data. Hopefully Tyler configured his config right... Does Tyler even config bro?
                    $(xml).find('config').each(function () {
                        //Java script has a crazy way of preparing an array of arrays of arrays.
                        //The satisfyArr in core.js becomes a 3? dimension array satisfyArray[0][scogroup(s)][satisfygroup(s)][$scoID(s)]
                        var i = 0;
                        var group = [];
                        //Survey Builder from CONFIG
                        /*
                         * THIS MAY GO AWAY
                         $(this).find("surveygroup").each(function () {
                            var surveygroup = $(this).find("surveygroup").children();
                            //this will find if the survey's lock the scos or not
                            var s = 0,
                                surveyArr = [];
                            $(this).find("survey").each(function () {
                                var $surveyName = $(this).attr("name"),
                                    $enabled = $(this).attr("enabled"),
                                    $required = $(this).attr("required");

                                $('#survey[data-survey="' + $surveyName + '"]');
                                $enabled == "false" ? $('#survey[data-survey="' + $surveyName + '"]').prop("disabled", true) : $('#survey[data-survey="' + $surveyName + '"]').prop("disabled", false)
                                if ($required == "true") {
                                    if ($surveyName == "presurvey") {
                                        window.parent.isPreSurveyRequired = true;
                                    } else if ($surveyName == "postsurvey") {
                                        window.parent.isPostSurveyRequired = true;
                                    }
                                    surveyArr.push($surveyName);
                                }
                            })
                            s++;
                            group.push(surveyArr)
                        });*/


                        //SCO builder from Config
                        $(this).find('scogroups').children().each(function () {
                            var j = 0;
                            var satisfy = [];

                            $(this).find('satisfy').each(function () {
                                var sco = [];

                                $(this).find('sco').each(function () {
                                    var $scoID = $(this).attr('id'); //The sco ID ie SCO_002 etc...
                                    var $nextSCO = $(this).attr('nextsco'); //Unlocks the next sco if it is locked for linear/non linear progression
                                    var $enabled = $(this).attr('enabled'); //Is it on when the menu loads?
                                    var $attempt = $(this).attr('attempt'); //Number of allowed attempts
                                    var $groupID = $(this).parents("group").attr("id"); //SCOGroup ID that this SCO resides in

                                    sco.push($scoID);

                                    $('#sco[data-sco="' + $scoID + '"]').attr('data-next', $nextSCO);
                                    $('#sco[data-sco="' + $scoID + '"]').attr('data-attempt', $attempt);
                                    $('#sco[data-sco="' + $scoID + '"]').attr('data-group', $groupID);

                                    if ($enabled == "false") {
                                        $('#sco[data-sco="' + $scoID + '"]').prop('disabled', true);
                                    }
                                    else {
                                        $('#sco[data-sco="' + $scoID + '"]').prop('disabled', false);
                                    }
                                });

                                j++;
                                satisfy.push(sco);
                            });

                            i++;
                            group.push(satisfy);
                        });

                        window.parent.satisfyArr.push(group);

                        $(this).find('certification').children().each(function () {
                            //TODO Re-Work requried scos array allowing for group ID's and individual SCO ID's
                            parent.window.requiredSCO.push($(this).attr('id'));
                        });

                    });

                },
                complete: function () {
                    //Maybe we can do some more fun things when this is completed, maybe not.
                    //disables scos if a PreSurvey is required for a course, this is set up in the config XML
                    if (window.parent.isPreSurveyRequired == true) {
                        $('.sco').each(function () {
                            $(this).addClass('disabledButton');
                        })
                        $("#sco").addClass('disabledButton');
                    }
                },
                failure: function (response) {
                    //We dont have a config or we lost connection
                    window.parent.hasConfig = false;
                },
                error: function (response) {
                    //We dont have a config or we lost connection
                    window.parent.hasConfig = false;
                }
            });
        }
        catch (e) {
            //It's ok if config.xml does not exist - the course will default to freemode/instructor led style.
            //Log the message(e) for OCD reasons.
            //We dont have a config or we lost connection
            window.parent.hasConfig = false;
        }
    }
}

function minimizeLessons() {
    $('#lesson').css({ "background": "url(inc/img/minus.png) no-repeat;" });
    $('#sco[data-lesson]').toggle();
    $('#sco[data-lesson]').css('height', 0);
    $('#lesson').attr('data-on', '1');
}

function allowPreSurvey() {
    $("#presurvey").attr("onclick", "parent.loadPreSurvey();");
    $("#presurvey").css({
        background: "url(inc/img/IconNotStarted.png) no-repeat;"
    })
}

function allowPostSurvey() {
    $("#postsurvey").attr("onclick", "parent.loadPostSurvey();");
}

function allowCertificate() {
    $("#certificate").attr("onclick", "parent.loadCertificate();");
    $("#certificate").css({ "background": "url(inc/img/comp.png) no-repeat;" });
}

function unlockCourse() {
    $('.sco').each(function () {
        $(this).removeClass('disabledButton');
    })
    $("#sco").removeClass('disabledButton');
}

$(document).on('click', '#sco', function () {

    $scoID = $(this).attr('data-sco');
    $nextSCO = $(this).attr('data-next');
    $scoGroup = $(this).attr('data-group');
    $attemptCount = $(this).attr('data-attempt');

    if ($attemptCount !== "0") {
        if (!$(this).is(':disabled')) {
            //Store the sco group
            window.parent.scoGroup = $scoGroup;
            //Store the next sco for unlock
            window.parent.nextSCO = $nextSCO;
            //Set the attempt count
            window.parent.attemptCount = $attemptCount;
            //Launch the SCO
            parent.buildScoAPI($scoID);
            parent.launchSCO($scoID);
        } else {
            //Nothing It's not enabled silly
        }
    }
    else {
        //Nothing - No attempts Left
    }

});

$(document).on('click', '#lesson', function () {

    if ($(this).attr('data-on') === "0") {
        $(this).css({ "background": "url(inc/img/minus.png) no-repeat;" });
        $('#sco[data-lesson="' + $(this).attr('data-lesson') + '"]').toggle();
        $('#sco[data-lesson="' + $(this).attr('data-lesson') + '"]').css('height', 0);
        $(this).attr('data-on', '1');
    }

    else if ($(this).attr('data-on') === "1") {
        $(this).css({ "background": "url(inc/img/plus.png) no-repeat;" });
        $('#sco[data-lesson="' + $(this).attr('data-lesson') + '"]').toggle();
        $('#sco[data-lesson="' + $(this).attr('data-lesson') + '"]').css('height', 'auto');
        $(this).attr('data-on', '0');
    }
});

///////////////////////////////////////////////////////////////////////////////////////
//TODO Working on some loading image stuff
var studentWindow = top.frames["Content"].document.getElementById('loading-image');

$(document).ajaxStart(function () {
    $(studentWindow).show();
});

$(document).ajaxStop(function () {
    $(studentWindow).hide();
});
///////////////////////////////////////////////////////////////////////////////////////

