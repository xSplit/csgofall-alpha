$("#extend-chat").click(function() {
	if($(this).attr("data-state") == "0") {
	$("#profile-area").slideUp();
	$(this).attr("class", "fa fa-compress");
	$(this).attr("data-state", "1");
	} else {
	$("#profile-area").slideDown();
	$(this).attr("class", "fa fa-expand");
	$(this).attr("data-state", "0");
	}
});

$(document).on('click', '#close-chat', function (event) {

});


$("#close-chat").click(function() {
	if($(this).attr("data-state") == "0") {
	$("#sidebar").attr("class", "height-mob");
	$("#chat-body-mob").attr("class", "hide-mob");
	$("#error-chat").attr("class", "hide-mob");
	$("#chat-footer").attr("class", "hide-mob");
	$(this).attr("class", "fa fa-expand");
	$(this).attr("data-state", "1");
	} else {
	$("#sidebar").attr("class", "height-mob-normal");
	$("#chat-body-mob").attr("class", "fix-bod-mob");
	$("#error-chat").attr("class", "fix-error-mob");
	$("#chat-footer").attr("class", "recover-enter-mob");
	$(this).attr("class", "fa fa-times");
	$(this).attr("data-state", "0");
	}
});


 $(document).ready(function(){
        $('#game1').mouseenter(function(){
            $('#game1-overlay').addClass('active-game-overlay'),
            $('#game1-overlay').removeClass('inactive-game-overlay');
        });
        $('#game1').mouseleave(function(){
            $('#game1-overlay').removeClass('active-game-overlay');
            $('#game1-overlay').addClass('inactive-game-overlay');
        });
    });
	
	
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});


$(document).mouseup(function (e)
{
    var container = $("#redeem-code-container");

    if (!container.is(e.target) 
        && container.has(e.target).length === 0) 
    {
        container.hide();
    }
});

$(document).mouseup(function (e)
{
    var container = $(".notifications-cont");

    if (!container.is(e.target)
        && container.has(e.target).length === 0)
    {
        container.hide();
    }
});
