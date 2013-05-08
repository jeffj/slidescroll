
$(document).ready(function() {
    if (parsed)
      onloadFB();
});

function onloadFB(){

	var myrepo='https://slidekick.firebaseio.com/', myRootRef = new Firebase(myrepo);
	currentObj=myRootRef.child(objID).child("current")
	switchon=auth

 if (auth){
 	currentObj.set(0)
  currentObj.onDisconnect().set(0);
	gallery.onFlip(function () {
		if (switchon)
		currentObj.set(gallery.pageIndex)
	});
 }


currentObj.on("value", function(snapshot) { 
  scrollTo (snapshot.val())
});


$('#mySwitch').on('switch-change', function (e, data) {
    var $el = $(data.el)
    , value = data.value;
   //alert(value);
   switchon=value;
   if(value==true)
   currentObj.set(gallery.pageIndex),
  $("#mySwitch").removeClass("fader");
    else
  $("#mySwitch").addClass("fader");




});



}

