
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

}
