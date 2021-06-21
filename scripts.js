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
//CONFIG_ROS_server_URI = 'josePC'


var left_bottom = [0,0]
var right_top = [0,0]
var map_shape = [0,0]
var polyline;

// ============================= SCRIPT

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

// FOR LINES
//https://gis.stackexchange.com/questions/53394/select-two-markers-draw-line-between-them-in-leaflet
var example_line = Array()

//===> ROS connexion
var ros = new ROSLIB.Ros({
	url : 'ws://'+ CONFIG_ROS_server_URI +':8080'
});

/*
var edgesActionClient = ROSLIB.ActionClient({
	ros: ros,
	serverName: "topological_map/edges",
	actionName : "gr_action_msgs/GREdgesAction"
})
*/

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
			title: "Do you want to enable workspace remote edition?",
			text: "After closing this popup, click on the left bottom and right top corners of the workspace.",
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


	var serviceclient = new ROSLIB.Service({
		ros: ros,
		name: "/topological/edges",
		serviceType : "gr_action_msgs/GREdges2",
	});

	L.easyButton('glyphicon glyphicon-cog', function(btn, map){
		console.log("engrane")
		if (selectionMode){
			/*
			var actionclient = new ROSLIB.ActionClient({
				ros: ros,
				serverName: "topological_map/edges",
				actionName : "gr_action_msgs/GREdgesAction",
				omitFeedback: true,
				omitStatus: true,
				omitResult: true
			})
			var message = new ROSLIB.Message({
				 long_left_bottom: left_bottom[0],
				 long_right_top: right_top[0],
				 lan_left_botton: left_bottom[1],
				 lan_right_top: right_top[1],
				 width_meters: map_shape[1],
				 height_meters: map_shape[0]
			})
			console.log(actionclient)
			var goal = new ROSLIB.Goal({
				actionClient: actionclient,
				goalMessage: message
			});
			goal.on('feedback', function(feedback) {
						 console.log('Feedback: ' + feedback.sequence);
					 });

			goal.on('result', function(result) {
						 console.log('Final Result: ' + result.sequence);
					 });
			*/

			var request = new ROSLIB.ServiceRequest({
				 long_left_bottom: left_bottom[0],
				 long_right_top: right_top[0],
				 lan_left_bottom: left_bottom[1],
				 lan_right_top: right_top[1],
				 width_meters: map_shape[1],
				 height_meters: map_shape[0]
			});
			serviceclient.callService(request, function (result) {
				console.log('Result for service call power_state = ' + result);

            alert('Result for service call power_state = ' + result);
      }, function(error){
				console.log("Got an error while trying to call power state service" + error);

            alert("Got an error while trying to call power state service" + error);
      });

			console.log("AAA")
		}
		else{
			alert("edition not enable")
		}
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
		closeOnConfirm: true,
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

//https://www.geodatasource.com/developers/javascript
function calculateDistance(lat1, lon1, lat2, lon2, unit='M') {//meters
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="M") { dist = dist * 1609.344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

map.on('click', function(e) {
	//When a click on the map is detected
	if(selectionMode == true)
	{
		//selectionMode = false;
		//First, get the coordinates of the point clicked
		var lat = e.latlng.lat;
		var lon = e.latlng.lng;
		//Place a marker
		markerFinish.setLatLng([lat,lon]);
		markerFinish.setOpacity(0.1);
		setTimeout(function() {
			swal({
				title: "Is this left bottom?",
				text: "Is this the left bottom or the right top?????",
				type: "info",
				confirmButtonText: "it is left!",
				buttons: true, //['left', 'right'],
				showCancelButton: true,
				closeOnConfirm: true,
				allowOutsideClick: false,
			},
			function(isConfirm){
				if (polyline != undefined){
					polyline.onRemove(map)
				}

				if (isConfirm)
				{
						//Logging stuff in the console
						console.log('Left Pose set to : '+lat + ' ' + lon);
						left_bottom = [lat,lon]
						//Set all the parameters to the destination
						paramStartLat.set(currentPosition.latitude);
						paramStartLon.set(currentPosition.longitude);
						paramEndLat.set(lat);
						paramEndLon.set(lon);
						paramEndGoTo.set(true);// goTo is set to true, that means that their is a new destination to consider.
					}
					else
					{
						console.log('Right Pose set to : '+lat + ' ' + lon);
						right_top = [lat,lon]
						//markerFinish.setOpacity(0);
					}

					var pointList = Array()
					pointList.push(new L.LatLng(left_bottom[0],left_bottom[1]))
					pointList.push(new L.LatLng(left_bottom[0], right_top[1]))


					console.log("distance 00 ", calculateDistance(left_bottom[0],left_bottom[1],right_top[0], right_top[1]))
					map_shape[1] = calculateDistance(left_bottom[0],left_bottom[1],right_top[0], right_top[1])

					console.log("distance 1", calculateDistance(left_bottom[0],left_bottom[1],left_bottom[0], right_top[1]))
					pointList.push(new L.LatLng(right_top[0], right_top[1]))
					pointList.push(new L.LatLng(right_top[0], left_bottom[1]))
					pointList.push(new L.LatLng(left_bottom[0],left_bottom[1]))
					console.log(calculateDistance(right_top[0],left_bottom[1],left_bottom[0],left_bottom[1]))

					map_shape[0] = calculateDistance(right_top[0],left_bottom[1],left_bottom[0],left_bottom[1])
					polyline = L.polyline(pointList,{color: 'blue', weight: 10, smoothFactor: 0.5}).addTo(map);
					// zoom the map to the polyline
					map.fitBounds(polyline.getBounds());

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

var tfClient = new ROSLIB.TFClient({
    ros : ros,
    fixedFrame : 'world',
    angularThres : 0.001,
    transThres : 0.001
  });

tfClient.subscribe('workspace', function(tf) {
    console.log(tf);
		console.log("tf");

});


/*tfClient.processFeedback((tf) => {
    console.log(tf);
});*/

/*
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
*/
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


// = > Perople Stuff
var safetyTopic = new ROSLIB.Topic({
	ros : ros,
	name : "/safety_score",
	messageType : 'std_msgs/Float32'
});

safetyTopic.subscribe(function(value){
	document.getElementById("score").innerHTML = "RIsk Status: " + value.data.toFixed(2)*100 + "%"
	//console.log("safety score received")
	//console.log(value)
});

// = > Perople Stuff
var detectionTopic = new ROSLIB.Topic({
	ros : ros,
	name : "/pointcloud_lidar_processing/detected_objects",
	messageType : 'geometry_msgs/PoseArray'
});


/*
var canvas = document.createElement("canvas");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);
canvas.setAttribute("style", "position: absolute; x:0; y:0;");
document.body.appendChild(canvas);

//Then you can draw a point at (10,10) like this:
var ctx = canvas.getContext("2d");
ctx.fillRect(10,10,1,1);
*/


detectionTopic.subscribe(function(value){
	//document.getElementById("score").innerHTML = "RIsk Status: " + value.data.toFixed(2)*100 + "%"
	//console.log("safety score received")
	//var ctx = canvas.getContext("2d");
	var mydata = new Array()

	//console.log(value)
	value.poses.forEach(function(pose){
		console.log({"x": pose.position.x.toFixed(1), "y": pose.position.y.toFixed(1)})
		mydata.push({"x": pose.position.x.toFixed(1), "y": pose.position.y.toFixed(1)})
		//ctx.fillRect(pose.x,pose.y,1,1);

	})

	var chart1 = document.getElementById("personChart").getContext("2d");
	//chart1.height = 10
	var x = new Chart(chart1, {
	   type: 'scatter',
		 scaleOverride : false,
		scaleSteps : 1,
		 scaleStepWidth : 50,
	 		scaleStartValue : 0,
	   data: {
	      datasets: [{
	         label: "Test",
	         data: mydata
	      }]
	   },
	   options: {
	      responsive: false,
				animation: false,
				maintainAspectRatio: false,
				scales: {
        yAxes: [{
            display: true,
            ticks: {
                suggestedMin: -5,    // minimum will be 0, unless there is a lower value.
								suggestedMax: 5,    // minimum will be 0, unless there is a lower value.

                // OR //
                beginAtZero: false   // minimum value will be 0.
            }
        }],
				xAxes: [{
						display: true,
						ticks: {
								suggestedMin: -5,    // minimum will be 0, unless there is a lower value.
								suggestedMax: 5,    // minimum will be 0, unless there is a lower value.

								// OR //
								beginAtZero: false   // minimum value will be 0.
						}
				}]
    }
	   }
	});
	console.log(mydata, "data")
	/*Original
	var x = new Chart(document.getElementById("personChart"), {
	   type: 'scatter',
	   data: {
	      datasets: [{
	         label: "Test",
	         data: [{
	            x: 0,
	            y: 5
	         }, {
	            x: 5,
	            y: 10
	         }, {
	            x: 8,
	            y: 5
	         }, {
	            x: 15,
	            y: 0
	         }],
	      }]
	   },
	   options: {
	      responsive: true
	   }
	});
	*/

});
