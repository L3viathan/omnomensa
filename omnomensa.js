var selectedMeal = '';

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
		if(dd<10){dd='0'+dd}
		if(mm<10){mm='0'+mm}

		//I'm so fucking sorry:
		var elements = $("<div>").html(data).find(".tab-" + Math.round(new Date(yyyy + "-" + mm + "-" + dd + " 00:00:00").getTime()/1000) + " .desc");
        for (var i=elements.length-1;i>=0;i--) {
            elem = elements[i].innerText.replace(/\s+\d+(,\d+)*\s*$/g, '').replace(/,.+/g, '').replace("mensaVital: ","").trim();
            if (elem == "täglich wechselnd") continue;
            $(".meals").append('<li class="fancybox"><span class="name">'+elem+'</span></li>');
		}
		$(".fancybox").click(function(event) {
			$(this).addClass('selected');
			$("body").addClass('meal-selected');
			$(this).off("click");
			$(".rating").attr('data-meal',$(this).innerText);
		});
		$(".rating li").click(function(event) {
			$(".rating li").off("click");
			console.log({rating: $(this).attr('id'), meal: $(".rating").attr('data-meal')});
			$.post('http://api.l3vi.de/mensa.json', {rating: $(this).attr('id'), meal: selectedMeal}).done(function(data){
                $("#good").text(data['good'] + " Votes");
                $("#okay").text(data['okay'] + " Votes");
                $("#bad").text(data['bad'] + " Votes");
			});
		});
	}
});

});
