$(function(){

$('.meals li').click(function(event) {
	/* Act on the event */
	$(self).addClass('selected');
	$("body").addClass('meal-selected');
});

});