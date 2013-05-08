$(document).ready(function() {
      document.getElementById("dropbox-chooser").addEventListener("DbxChooserSuccess",
        function(e) {
          $("#dropbox-input").val(e.files[0].link) 
          $(this).val(e.files[0].link) 

          	var slices=e.files[0].link.split("/"), txtslice=slices[slices.length-1]   
              filename="..."
              filename+=txtslice.slice(txtslice.length-13)
          $("#dropbox-filname").html( filename )

       $("#start-presenting-fake").css("display","none")
       $("#start-presenting").css("display","inline")


          $("#main-form").attr("action","/")



          $("#filename").html( filename )


    }, false);

          function manualLink(){
     
      $("#start-presenting").removeAttr("disabled")
      $("#start-presenting").html("Start Presenting")
      $("#start-presenting").removeClass("btn-info").addClass("btn-success")

    }
    window.manualLink=manualLink

    $("#input-file").change(function(e){
       $("#main-form").attr("action","/upload")
       // $("#dropbox-input").val( $(this).val() ) 
       // $("#start-presenting").removeAttr("disabled")
       // $("#start-presenting").html("Start Presenting") 		   
       // //$("#input-filname").html($(this).val())
       $("#start-presenting-fake").css("display","none")
       $("#start-presenting").css("display","inline")

       var filepart=$(".file-input-name").html().split("fakepath")

       $("#filename").html( filepart[filepart.length-1].slice(1) )

    })

function nextsignup(){

  if (validateEmail($("#email-input").val() )){
    $("#collapsetwo").collapse("show")
    $("#collapseone").collapse("hide")
  } else{


  }  


}
window.nextsignup=nextsignup

function validateEmail(email) { 
  
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


});



