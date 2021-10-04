//===> Global variables
var map;
var selectionMode;//ommit confimation and set this to true
var bounds;
var currentPosition = {latitude : 0, longitude : 0};
var startPoint;
var endPoint;
var markerPosition = L.marker([0,0]);
var markerFinish = L.marker([0,0]);
var zoomLevel = 16;
var routeControl;
var loadedMap = false;
var i = 0;
var listenerGPS;
var listenerMarker;

// Network address to ROS server (it can be localhost or an IP)
var CONFIG_ROS_server_URI = '10.248.0.44'
//CONFIG_ROS_server_URI = 'nmbu-ThinkPad-T480'
//CONFIG_ROS_server_URI = 'josePC'
CONFIG_ROS_server_URI='localhost'

//===> ROS connexion
console.log("ROS")
var ros = new ROSLIB.Ros({
	url : 'ws://'+ CONFIG_ROS_server_URI +':9090'
});

ros.on('close', function() {
	console.log("Connexion closed.");
	swal({
		title: "Error connecting the ROS server",
		text: "Unable to reach ROS server. Is rosbridge launched? in server: " + CONFIG_ROS_server_URI,
		type: "error",
		confirmButtonText: "Retry",
		closeOnConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false
	},
	function(){
		window.location.reload();
	});
});
