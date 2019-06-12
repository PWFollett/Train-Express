var firebaseConfig = {
  apiKey: "AIzaSyBaBc0pAA8gJJa8OYTcXD88o9mCRmXAQ8I",
  authDomain: "train-schedule-3b2da.firebaseapp.com",
  databaseURL: "https://train-schedule-3b2da.firebaseio.com",
  projectId: "train-schedule-3b2da",
  storageBucket: "train-schedule-3b2da.appspot.com",
  messagingSenderId: "429821443833",
  appId: "1:429821443833:web:ef80946211d4bbad"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var trainName = "";
var destination = "";
var startTime = "";
var frequency = 0;

function currentTime() {
  var current = moment().format('PF');
  $("#currentTime").html(current);
  setTimeout(currentTime, 2000);
};

$(".form-field").on("keyup", function() {
  var traintemp = $("#train-name").val().trim();
  var citytemp = $("#destination").val().trim();
  var timetemp = $("#first-train").val().trim();
  var freqtemp = $("#frequency").val().trim();

  sessionStorage.setItem("train", traintemp);
  sessionStorage.setItem("city", citytemp);
  sessionStorage.setItem("time", timetemp);
  sessionStorage.setItem("freque", freqtemp);
});

$("#train-name").val(sessionStorage.getItem("train"));
$("#destination").val(sessionStorage.getItem("city"));
$("#first-train").val(sessionStorage.getItem("time"));
$("#frequency").val(sessionStorage.getItem("freque"));

$("#submit").on("click", function(event) {
  event.preventDefault();

  if ($("#train-name").val().trim() === "" ||
    $("#destination").val().trim() === "" ||
    $("#first-train").val().trim() === "" ||
    $("#frequency").val().trim() === "") {

    alert("Please fill in all details to add new train");

  } else {

    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    startTime = $("#first-train").val().trim();
    frequency = $("#frequency").val().trim();

    $(".form-field").val("");

    database.ref().push({
      trainName: trainName,
      destination: destination,
      frequency: frequency,
      startTime: startTime,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    sessionStorage.clear();
  }

});

database.ref().on("child_added", function(childSnapshot) {
  console.log(childSnapshot.val())
  var startTimeConverted = moment(childSnapshot.val().startTime, "hh:mm").subtract(1, "years");
  var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
  var timeRemain = timeDiff % childSnapshot.val().frequency;
  var minToArrival = childSnapshot.val().frequency - timeRemain;
  var nextTrain = moment().add(minToArrival, "minutes");
  var key = childSnapshot.key;

  var newrow = $("<tr>");
  newrow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
  newrow.append($("<td>" + childSnapshot.val().destination + "</td>"));
  newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
  newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
  newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
  newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));

  if (minToArrival < 6) {
    newrow.addClass("info");
  }

  $("#train-table-rows").append(newrow);

});

$(document).on("click", ".arrival", function() {
  keyref = $(this).attr("data-key");
  database.ref().child(keyref).remove();
  window.location.reload();
});

currentTime();

setInterval(function() {
  window.location.reload();
}, 10000);