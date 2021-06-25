function setupLocation(){
	console.log("setupLocation")
	setListenerGPS()
  setListenerRegion()
}

function endLocation(){
	console.log("endLocation")
	listenerGPS.unsubscribe()
  listenerMarker.unsubscribe()
	//listenerGPS = null;
	//map.off()
}

function setupSafety(){
	console.log("setupSafety")
	setListenerSafety()
  setListenerCamera()
  setListenerPeople()
}

function endSafety(){
	console.log("endSafety")
  image_topic.unsubscribe()
  detectionTopic.unsubscribe()
  safetyTopic.unsubscribe()
}

function setupStatus(){
	console.log("setupStatus")
	setListenerSafety()
  setListenerPeople()
}

function endStatus(){
	console.log("endStatus")
  safetyTopic.unsubscribe()
  detectionTopic.unsubscribe()
}

function setListenerCamera(){
  console.error("seting camera")
	image_topic.subscribe(function(message) {
		console.log("in image")
	  document.getElementById('my_image').src = "data:image/jpg;base64," + message.data;
	});
}

function setListenerGPS(){
	//===> Set the GPS listener
	console.log("subscriber gps msg "+paramTopicNameValue)
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
}

function setListenerSafety(){
  // = > Perople Stuff
  safetyTopic.subscribe(function(value){
  	document.getElementById("score").innerHTML = "RIsk Status: " + value.data.toFixed(2)*100 + "%"
  	//console.log("safety score received")
  	//console.log(value)
  });
}

function setListenerRegion(){
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
  })
}

function setListenerPeople(){

  var ctx = document.getElementById("personChart").getContext("2d");
  var x = null

  detectionTopic.subscribe(function(value){
  	//document.getElementById("score").innerHTML = "RIsk Status: " + value.data.toFixed(2)*100 + "%"
  	//console.log("safety score received")
  	//var ctx = canvas.getContext("2d");
  	var mydata = []
  	var ids = ""
  	mydata.push({"x":0.0, "y": 0.0, "r": 20.0})
  	var labels = new Array()

  	//console.log(value)
  	value.objects.forEach(function(object){
  		//console.log({"x": pose.position.x.toFixed(1), "y": pose.position.y.toFixed(1)})
  		//mydata.push({label:object.object_id, data: {x: parseFloat(1), y: parseFloat(2), "r": parseFloat(10)}, type: "bubble"})

  		//mydata.push({"label": object.object_id, "data": {"x": object.pose.position.x.toFixed(1), "y": object.pose.position.y.toFixed(1), "r": 10}})
  		labels.push(object.object_id)
  		ids = ids+ object.object_id + " "
  		mydata.push({"x": object.pose.position.x.toFixed(1), "y": object.pose.position.y.toFixed(1), "r": 10})
  		//ctx.fillRect(pose.x,pose.y,1,1);

  	})

  	//console.log(mydata)

  	document.getElementById("ndetections").innerHTML = "Number of Detections: "+ value.objects.length;
  	document.getElementById("iddetections").innerHTML = "IDs: "+ ids;

  	//console.log(x)
  	if (x){
  		//console.log("destroy chart")
  		x.destroy()
  	}
  	else{
  		console.log("first run")
  	}
  	//chart1.height = 10
  	ctx.fillStyle = 'green';
  	x = new Chart(ctx, {
  	   type: 'bubble',
  		 showLine: false,
  		 scaleOverride : false,
  			//scaleSteps : 50,
  		// scaleStepWidth : 50,
  		//scaleStartValue : 0,
  	   data: {
  			 datasets: [{
                  label: "Detections",
                  data: mydata
               }]

  	      //datasets: mydata,// [{
  	      //fzlabels: labels,
  	      //   data: mydata
  	      //}]
  	   },
  	   options:{
  	      responsive: true,
  				animation: false,
  				maintainAspectRatio: true,
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
  	//x.render()
  	//console.log(mydata, "data")
  	/*Original
  	var x = new Chart(document.getElementById("personChart"), {
  	   type: 'scatter',
  	   data: {w
  	      datasets: [{
  	         label: "Test",
  	         data: [{
  	            x: 0,
  	            y: 5
  	         }, {
  	            x: //5,
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
}
