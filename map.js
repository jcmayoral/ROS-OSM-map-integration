// We can download the map online on OSM server, but
// it won't work if the car isn't connected to the internet.
// If you downloaded tiles and put it in the car, then you can
// access them in local, or else, connect to server.
// Set this config to "local" or "server".
var CONFIG_tile_source = 'server'


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

//===> Init the map and the click listener
mapInit();

paramStartLat.set(0);
paramStartLon.set(0);
paramEndLat.set(0);
paramEndLon.set(0);
paramEndGoTo.set(false);


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
