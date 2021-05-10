// ============================= INTRODUCTION

// Name : Autonomous-Car-GPS-Guiding
// Author : Sylvain ARNOUTS
// Mail : sylvain.ar@hotmail.fr
// Date : From May to August 2016
// Link : https://github.com/sylvainar/Autonomous-Car-GPS-Guiding

// This code has been written in order to create a nice interface to interact
// with the autonomous electric car of the UPV ai2 laboratory. It displays a map,
// set a marker on the car's position using gps publishing topic, and allows a user
// to start the routing by tapping the destination on the touchscreen.

// License : Apache 2.0

// ============================= CONFIGURATION

// You can set here some parameters for the launch.
// In the lab we're using two different GPS, so further in the
// program, we're going to read rosparam to know what topic
// we should listen to and what is the number of cycles
// between each refreshing.

// The name of the GPS publisher name by default
var CONFIG_default_gps_topic_name = '/fix';
var CONFIG_default_markers_topic_name = '/region';
var CONFIG_default_people_topic_name = '/people';

// The number of cycles between every marker position reload
var CONFIG_cycles_number = 20;

// We can download the map online on OSM server, but
// it won't work if the car isn't connected to the internet.
// If you downloaded tiles and put it in the car, then you can
// access them in local, or else, connect to server.
// Set this config to "local" or "server".
var CONFIG_tile_source = 'server'

// If you use local tiles, set here the path to it
var CONFIG_tile_local_path = 'UPV/{z}/{x}/{y}.png';

// Network address to ROS server (it can be localhost or an IP)
var CONFIG_ROS_server_URI = 'localhost';
//CONFIG_ROS_server_URI = 'nmbu-ThinkPad-T480'


// ============================= FUNCTIONS

// ===> mapInit() : init the map
function mapInit() {

	//===> Var init

	// Fetch tiles
	if(CONFIG_tile_source == 'local')
		var tileUrl = CONFIG_tile_local_path;
	if(CONFIG_tile_source == 'server')
		var tileUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';

	// Set attrib (always !)
	var attrib = 'Map data © OpenStreetMap contributors';

	//===> Map loading
	map = L.map('map');
	var osm = L.tileLayer(tileUrl, {
		minZoom: 12,
		maxZoom: 18,
		attribution: attrib
	});
	osm.addTo(map);

	L.easyButton('glyphicon-road', function(btn, map){
		swal({
			title: "Where do you want to go ?",
			text: "After closing this popup, click on the place you want to go.",
			type: "info",
			confirmButtonText: "Got it!",
			showCancelButton: true,
			closeOnConfirm: true,
			showLoaderOnConfirm: true,
			allowOutsideClick: false,
		},
		function(isConfirm){
			if (isConfirm) selectionMode = true;
			else selectionMode = false;
		});
	}).addTo(map);

	L.easyButton('glyphicon glyphicon-cog', function(btn, map){
		console.log("engrane")
		// TODO : add the possibility to modify params on the run
	}).addTo(map);

	L.easyButton('glyphicon glyphicon-coaaag', function(btn, map){
		console.log("My button")
		// TODO : add the possibility to modify params on the run
	}).addTo(map);

	L.easyButton('glyphicon glyphicon-refresh', function(btn, map){
		window.location.reload();
	}).addTo(map);

	markerFinish.addTo(map).setOpacity(0)

	return map;
}

// ============================= SCRIPT

//===> Global variables
var map;
var selectionMode;
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

// FOR LINES
//https://gis.stackexchange.com/questions/53394/select-two-markers-draw-line-between-them-in-leaflet
var example_line = Array()

//===> ROS connexion
var ros = new ROSLIB.Ros({
	url : 'ws://'+ CONFIG_ROS_server_URI +':9090'
});

swal({
	title: "Connecting to ROS...",
	showConfirmButton: true,
	closeOnConfirm: false,
	showLoaderOnConfirm: true,
	allowOutsideClick: false,
	allowEscapeKey: false
});

ros.on('connection', function() {
	console.log('Connected to websocket server.');
	swal({
		title: "Waiting...",
		text: "The navigation module can't work without the GPS. Launch the GPS and the module will start automatically.",
		type: "info",
		confirmButtonText: "Reload",
		closeOnConfirm: false,
		allowOutsideClick: false,
		allowEscapeKey: false
	},
	function(){
		window.location.reload();
	});
});

ros.on('error', function(error) {
	console.log('Error connecting to websocket server: ', error);
	swal({
		title: "Error connecting the ROS server",
		text: "Unable to reach ROS server. Is rosbridge launched ? "+ CONFIG_ROS_server_URI,
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

//===> Init the routing parameters
var paramStartLat = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/start/latitude'
});
var paramStartLon = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/start/longitude'
});
var paramEndLat = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/latitude'
});
var paramEndLon = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/longitude'
});
var paramEndGoTo = new ROSLIB.Param({
	ros : ros,
	name : '/routing_machine/destination/goTo'
});

paramStartLat.set(0);
paramStartLon.set(0);
paramEndLat.set(0);
paramEndLon.set(0);
paramEndGoTo.set(false);

//===> Init the map and the click listener

mapInit();

map.on('click', function(e) {
	//When a click on the map is detected
	if(selectionMode == true)
	{
		selectionMode = false;
		//First, get the coordinates of the point clicked
		var lat = e.latlng.lat;
		var lon = e.latlng.lng;
		//Place a marker
		markerFinish.setLatLng([lat,lon]);
		markerFinish.setOpacity(0.1);
		setTimeout(function() {
			swal({
				title: "Is this correct ?",
				text: "Confirm the position to start the navigation.",
				type: "info",
				confirmButtonText: "Yes, let's go !",
				showCancelButton: true,
				closeOnConfirm: true,
				allowOutsideClick: false,
			},
			function(isConfirm){
				if (isConfirm)
				{
						//Logging stuff in the console
						console.log('Routing Start !');
						console.log('Start set to : '+ currentPosition.latitude + ' ' + currentPosition.longitude);
						console.log('Destination set to : '+lat + ' ' + lon);
						//Set all the parameters to the destination
						paramStartLat.set(currentPosition.latitude);
						paramStartLon.set(currentPosition.longitude);
						paramEndLat.set(lat);
						paramEndLon.set(lon);
						paramEndGoTo.set(true);// goTo is set to true, that means that their is a new destination to consider.
					}
					else
					{
						markerFinish.setOpacity(0);
					}
				})}, 1000);
	}
});

//===> Set the GPS listener

//  => Create param with initial value
var paramTopicNameValue = CONFIG_default_gps_topic_name;
var paramNbCyclesValue = CONFIG_cycles_number;

//  => Init the ROS param
var paramTopicName = new ROSLIB.Param({ros : ros, name : '/panel/gps_topic'});
var paramNbCycles = new ROSLIB.Param({ros : ros, name : '/panel/nb_cycles'});

// = > Markers
var paramMarkersTopicName = new ROSLIB.Param({ros : ros, name : '/panel/markers_topic'});

// = > Perople Stuff
var paramPersonsTopicName = new ROSLIB.Param({ros : ros, name : '/panel/persons_topic'});

//  => Set the value
paramTopicName.get(function(value) {
	console.log(value, "GPS")
	// If the param isn't created yet, we keep the default value
	if(value != null)
		paramTopicNameValue = value;
	else
		paramTopicName.set(paramTopicNameValue);

	paramNbCycles.get(function(value) {
		// If the param isn't created yet, we keep the default value
		if(value != null)
			paramNbCyclesValue = value;
		else
		paramNbCycles.set(paramNbCyclesValue);

		// Set the listener informations
		listenerGPS = new ROSLIB.Topic({
			ros : ros,
			name : paramTopicNameValue,
			messageType : 'sensor_msgs/NavSatFix'
		});

		// Set the callback function when a message from /gps is received

		var i = 0;
		console.log("antes del subscribe"+paramTopicNameValue)

		listenerGPS.subscribe(function(message) {
			// We have to wait for the GPS before showing the map, because we don't know where we are
			var lat = message.latitude;
			var lon = message.longitude;

			if(loadedMap == false)
			{
				swal.close();
				// Center the map on the car's position
				map.setView([lat, lon], zoomLevel);
				// Add the marker on the map
				markerPosition.addTo(map);
				// Set the flag to true, so we don't have to load the map again
				loadedMap = true;
			}

			if(i == paramNbCyclesValue)
			{
				// Refresh the global variable with the position
				currentPosition.latitude = lat;
				currentPosition.longitude = lon;
				// Refresh the position of the marker on the map
				markerPosition.setLatLng([lat, lon]);
				// If the marker has went out of the map, we move the map
				bounds = map.getBounds();
				if(!bounds.contains([lat, lon]))
					map.setView([lat, lon], zoomLevel);

				i=0
			}

			i++;

		});
	});
});

/*
var tfClient = new ROSLIB.TFClient({
    ros : ros,
    fixedFrame : 'world',
    angularThres : 0.0,
    transThres : 0.0
  });

tfClient.subscribe('workspace', function(tf) {
    console.log(tf);
});
*/
console.log("register image")
var image_topic = new ROSLIB.Topic({
  ros: ros, name: '/usb_cam/image_raw/compressed',
  messageType: 'sensor_msgs/CompressedImage'
});
image_topic.subscribe(function(message) {
	console.log("in image")
  document.getElementById('my_image').src = "data:image/jpg;base64," + message.data;
  image_topic.unsubscribe();
});

paramMarkersTopicName.get(function(value) {
	console.log("AQUI", value)

	listenerMarker = new ROSLIB.Topic({
		ros : ros,
		name : "/region",
		messageType : 'visualization_msgs/Marker'
	});

	listenerMarker.subscribe(function(message){

		const center_lat = 	currentPosition.latitude;
		const center_lng = currentPosition.longitude;
		var pointList = Array()
		pointList.push(new L.LatLng(center_lat-.001,center_lng+.001))
		pointList.push(new L.LatLng(center_lat+.001,center_lng+.001))
		pointList.push(new L.LatLng(center_lat + .001, center_lng-.001))
		pointList.push(new L.LatLng(center_lat-.001,center_lng-.001))
		pointList.push(new L.LatLng(center_lat-.001,center_lng+.001))
		console.log(pointList)
		console.log(center_lat)
		console.log(center_lng)

		var polyline = L.polyline(pointList,{color: 'red', weight: 10, smoothFactor: 0.5}).addTo(map);
		// zoom the map to the polyline
		map.fitBounds(polyline.getBounds());
	});
});
