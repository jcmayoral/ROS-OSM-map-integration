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
var CONFIG_ROS_server_URI = 'localhost'
var PORT='9090'
//CONFIG_ROS_server_URI = 'nmbu-ThinkPad-T480'
//CONFIG_ROS_server_URI = 'josePC'
//CONFIG_ROS_server_URI='192.168.1.67'
//CONFIG_ROS_server_URI='189.147.236.185'
//CONFIG_ROS_server_URI='PHD-PC`'
CONFIG_ROS_server_URI='grassrobotics.sytes.net'
//===> ROS connexion
var ros = new ROSLIB.Ros({
	url : 'ws://'+ CONFIG_ROS_server_URI +':9090',
	//url : CONFIG_ROS_server_URI +':9090',
	transportLibrary : 'websocket'
});

//ros.connect('ws://'+ CONFIG_ROS_server_URI +':'+ PORT);

ros.on('error', function(error){
	console.log(error)
})

ros.on('close', function() {
	console.log("Connexion closed.");
	swal({
		title: "Error connecting the ROSSS server",
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


console.log("should be fine -> " , CONFIG_ROS_server_URI, PORT)
