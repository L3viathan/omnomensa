$(function(){
    
$('.meals li').click(function(event) {
	/* Act on the event */
	$(self).addClass('selected');
	$("body").addClass('meal-selected');
});

$.ajax({
	url: "http://mensaproxy.l3vi.de/de/Essen/Essen-in-Saarbrucken/Speiseplan-aktuell",
	dataType: "text",
	success: function(data) {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1;//January is 0!`
		var yyyy = today.getFullYear();
		if(dd<10){dd='0'+dd;}
		if(mm<10){mm='0'+mm;}

		//I'm so fucking sorry:
		var elements = $("<div>").html(data).find(".tab-" + Math.round(new Date(yyyy, mm-1, dd).getTime()/1000) + " .desc");
        elements.each(function(){
            elem = $(this).text().replace(/\s+\d+(,\d+)*\s*$/g, '').replace(/,.+/g, '').replace("mensaVital: ","").replace("ZIS Spezialitätentag ","").replace("Heute für Sie: ","").replace("Vegan: ","").replace('( ','(').replace(' )',')').trim();
            if (elem == "täglich wechselnd") return;
            $(".meals").append('<li class="fancybox"><span class="name">'+elem+'</span></li>');
		});
		$(".fancybox").click(function(event) {
			$(this).addClass('selected');
			$("body").addClass('meal-selected');
			$(this).off("click");
			$(".rating").data('meal',$(this).text());
		});
		$(".rating li").click(function(event) {
			$(".rating li").off("click");
			console.log({rating: $(this).attr('id'), meal: $(".rating").data('meal')});
			$.post('http://api.l3vi.de/mensa.json', 'rating=' + $(this).attr('id') + '&meal=' + $(".rating").data('meal')).done(function(data){
				console.log(data);
                $("#good").text(data['good'] + " Votes");
                $("#okay").text(data['okay'] + " Votes");
                $("#bad").text(data['bad'] + " Votes");
			});
		});
	}
});

});
