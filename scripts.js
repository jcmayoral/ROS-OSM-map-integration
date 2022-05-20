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


var left_bottom = [0,0]
var right_top = [0,0]
var map_shape = [0,0]
var polyline;

// ============================= SCRIPT

// FOR LINES
//https://gis.stackexchange.com/questions/53394/select-two-markers-draw-line-between-them-in-leaflet
var example_line = Array()

// ============================= FUNCTIONS


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

/*tfClient.processFeedback((tf) => {
    console.log(tf);
});*/
