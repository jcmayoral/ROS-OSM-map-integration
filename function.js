var CURRENTTAB= null

document.addEventListener("DOMContentLoaded", function (event) {
     var city;//define your city var

    //find all tab classes with queryselector
    const buttons = document.querySelectorAll(".tablinks")
		//loop though them and add click event
    for (const button of buttons) {
    	button.addEventListener('click', function(event) {
     	tabid = this.innerHTML;
      setup(event, tabid)

      //openCity(event,city);
      })
    }
});


function setup(event, tabid){
  console.log("setup", tabid)
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabid).style.display = "block";
  event.currentTarget.className += " active";
  console.log(map_function[tabid], CURRENTTAB);
  endmap_function[CURRENTTAB]();
  map_function[tabid](tabid);

}

function runSafety(tabid){
  console.log("run," + tabid +  " instead of " +  CURRENTTAB);
  CURRENTTAB = tabid;
  console.log("after", tabid)
}

function runStatus(tabid){
  console.log("run," + tabid +  " instead of " +  CURRENTTAB);
  CURRENTTAB = tabid;
  console.log("after", tabid)
}

function runLocation(tabid){
  console.log("run," + tabid +  " instead of " +  CURRENTTAB);
  setupLocation()
  CURRENTTAB = tabid;
  console.log("after", tabid)
}

function endSafety(){
	console.log("endSafety")
}

function endStatus(){
	console.log("endStatus")
}


map_function = {
  "Safety System": runSafety,
  "Status": runStatus,
  "Location": runLocation
}

endmap_function = {
  "Safety System": endSafety,
  "Status": endStatus,
  "Location": endLocation,
  null: function() {
    console.log("Starting")
  }
}
