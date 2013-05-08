document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

$(document).ready(function() {
	if (parsed)
  		onload()
  	else
  		counter(20000)
});

function counter(timeleft){

	if (timeleft<0){
		window.location.href = 	window.location.href;
		return
	}

   $("#counter-box").html(timeleft/1000)
   setTimeout(function(){
		
		var time=timeleft-1000
		counter(time)

   },1000)
   

}

function onload(){
var	el,
	i,
	page,
	dots = document.querySelectorAll('#nav li');
	gallery=new SwipeView('#wrapper', { numberOfPages: slides.length });





function scaletoggle(){
	$(document).toggleFullScreen();
	scale();
}
window.scaletoggle=scaletoggle
$(document).bind("fullscreenchange", function() {
	if($(document).fullScreen())
    $("#scalefull").css("display","none"),
	$("#scaleunfull").css("display","")
	else
	$("#scalefull").css("display",""),
	$("#scaleunfull").css("display","none");

});
$(window).resize(function() {
  scale();
});
var imgloaded=false
function scale(div){
	if (imgloaded && div!=undefined)
		return
	else
		imgloaded=true
	if(div==undefined)
		div=$("#swipeview-masterpage-"+gallery.currentMasterPage+" img")

var scalval=$(document).height()/$(document).width()
scaleper=scalval*100

			if(scalval*$(document).height()>div.height())

				$("#wrapper").addClass("widthscale").removeClass("heightscale");
			else{
					$("#wrapper").removeClass("widthscale").addClass("heightscale");
			}				
}
window.scale=scale

	$("#selector").change(function(e){
			var number=Number($(this).val() )-1
			gallery.goToPage(number)
	});
	window.addEventListener("orientationchange", function() {
		$("#wrapper").removeClass("heightscale").removeClass("widthscale");
		imgloaded=false

				setTimeout(function(){
				scale($("#wrapper img:first"))


				},1000)

	}, false);

	$(window).bind('keydown', function(event) {
		if (gallery!=undefined && gallery.deactive)
		 return;
		else if (event.which == 39)
		  gallery.next();
		else if (event.which == 32)
			gallery.next();
		else if (event.which == 37)
			gallery.prev();
	});
	countnum=9000
	function fade(num){

		//if (num)
		//	countnum=num


		if (countnum>0){
			setTimeout(function(){
				countnum-=1000
				fade()
			},1000)}
			else
			 $(".fader").fadeOut()

		

	}

	function move(){
		$(".fader").fadeIn()
		if (countnum==0)
		countnum=5000,
		fade(5000);
		else
		countnum=7000
	}
	function showpopover(){
		$("[rel=popover]").popover("show");
		var modalclose = new Hammer(document.getElementById("modalclose"));
		modalclose.ontap = function(ev) {
		console.log("tap");
		window.syncModalClose();
	 };
	}
	window.showpopover=showpopover

	fade();

	var wrapperClick = new Hammer(document.getElementById("wrapper"));
		wrapperClick.ontap = function(ev) {
		move();
	 };

	$(window).mousemove(function(){move()})

	if (popover)
		$("[rel=popover]").popover("show");
	
	setTimeout(function(){
	$("[rel=popover]").popover("hide");
	//$("#mySwitch").addClass("fader")
	},20000)




	syncModalClose=function (){
	$("[rel=popover]").popover("hide");
	}
	window.syncModalClose=syncModalClose

// Load initial data
for (i=0; i<3; i++) {
	page = i==0 ? slides.length-1 : i-1;
	el = document.createElement('img');
	el.className = 'loading';
	el.src = slides[page].img;


//	el.width = slides[page].width;
//	el.height = slides[page].height;
	el.onload = function () { 

		setTimeout(function(){
			scale($("#wrapper img:first"))
			$("#wrapper img").removeClass("loading")
		},1500)//timeout makes the image resize work

		//this.className = ''; 
		}

	gallery.masterPages[i].appendChild(el);

	el = document.createElement('span');
//	el.innerHTML = slides[page].desc;
//	gallery.masterPages[i].appendChild(el)
}

gallery.onFlip(function () {
	var el,
		upcoming,
		i;
	for (i=0; i<3; i++) {

		upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;

		if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
			
			el = gallery.masterPages[i].querySelector('img');
			el.className = 'loading';
			el.src = slides[upcoming].img;
			el.onload = function () {
			this.className=""
				
				
			//if(window.innerWidth<this.width)
			// if(window.innerHeight>this.height)
			// 	$("#wrapper").addClass("widthscale").removeClass("heightscale");
			// else
			// 	$("#wrapper").addClass("heightscale").removeClass("widthscale");
		
		

		}
		//	el.width = slides[upcoming].width;
	//		el.height = slides[upcoming].height;
			
			el = gallery.masterPages[i].querySelector('span');
		//	el.innerHTML = slides[upcoming].desc;
		}else
		$("#selector").val(gallery.pageIndex+1)

	
	}
	
//	document.querySelector('#nav .selected').className = '';
//	dots[gallery.pafgeIndex+1].className = 'selected';
});

gallery.onMoveOut(function () {
	gallery.masterPages[gallery.currentMasterPage].className = gallery.masterPages[gallery.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');
});

gallery.onMoveIn(function () {
	var className = gallery.masterPages[gallery.currentMasterPage].className;
	/(^|\s)swipeview-active(\s|$)/.test(className) || (gallery.masterPages[gallery.currentMasterPage].className = !className ? 'swipeview-active' : className + ' swipeview-active');
});

}

function scrollTo(num){

//var backdif=gallery.options.numberOfPages-num, frontdif=gallery.pageIndex-num

if (gallery.pageIndex>num)
	gallery.prev(), scrollTo(num);
else if (gallery.pageIndex<num)
	gallery.next(), scrollTo(num);
}

