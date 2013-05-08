$(document).ready(function () {

    if(typeof autopost !="undefined" && autopost)
        $("form#main-form button").removeAttr("disabled"),
        $("form#main-form button").click();


  // confirmations
  $('.confirm').submit(function (e) {
    e.preventDefault();
    var self = this;
    var msg = 'Are you sure?';
    bootbox.confirm(msg, 'cancel', 'Yes! I am sure', function (action) {
      if (action) {
        $(self).unbind('submit');
        $(self).trigger('submit');
      }
    });
  });

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });

  $(function () {
    $('#myTab a:last').tab('show');
  })

  //timelocalizer
  $( ".time-localize" ).each(function( index ) {
   date= formatDate ( $(this).text() ) 
  $(this).text(date)
  })

  function formatDate(d) {
  var date = new Date( Number(d) ); 
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  return monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear() +', '+date.getHours()+":"+('0' +(date.getMinutes()+1)).slice(-2) 
  }
});

//data loading
      $('.buttonLoad')
      .click(function () {
        var btn = $(this)
        btn.button('loading')
      })


window.tutorialModalClose =function(){
$("#prompt-upload").popover("hide")
}
window.tutorialModalOpen =function(){
$("#prompt-upload").popover("show")
}



function planselect(type){
 $("#collapseTwo").collapse('show')
 $('select[name="plan"]').val(type)

 goToByScroll("payment-input");

}

function goToByScroll(id){
      // Remove "link" from the ID
    id = id.replace("link", "");
      // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top},
        'slow');
}

