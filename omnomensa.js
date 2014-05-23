String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

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
        var day = parseInt(/today = '(\d)'/.exec(data)[1]) + 1;
        console.log(day);

        var elements = $("<div>").html(data).find(".tab:nth-child(" + day + ") .desc");

        elements.each(function(){
            elem = $(this).text().replace(/\s+\d+(,\d+)*\s*$/g, '').replace(/,.+/g, '').replace("mensaVital: ","").replace("Tagesessen: ","").replace("ZIS Spezialitätentag ","").replace("Heute für Sie: ","").replace("Heute für Sie ","").replace("Vegan: ","").replace('( ','(').replace(' )',')').replace(/Büffet.+$/g,'Büffet').trim();
            var price = $(this).prev().children('.price:first-child').text();
            if (elem == "täglich wechselnd") return;
            $.post('http://api.l3vi.de/mensa.json', 'rating=0&meal='+elem).done(function(rating_data){
                if (rating_data['number'] == 0) {
                    rating_data['number'] = 1;
                }
                $(".meals").append('<li class="fancybox"><span class="name">'+rating_data['name']+' </span> <span class="meal-stars"> ' + "★".repeat(Math.round(rating_data['stars']/rating_data['number'])) + '</span><span class="price">' + price + '</span></li>');
                $(".fancybox").click(function(event) {
                    History.pushState({state:1}, "Mensadingsi: Rate meal", "?rate");
                    $(this).addClass('selected');
                    $("body").addClass('meal-selected');
                    $(this).off("click");
                    $("#rating").data('meal',$(this).children(".name").text());
                });
            });
        });
        $("#rating span").click(function(event) {
            $("#rating span").off("click");
            console.log({rating: $(this).attr('id'), meal: $("#rating").data('meal')});
            $.post('http://api.l3vi.de/mensa.json', 'rating=' + $(this).attr('id') + '&meal=' + $("#rating").data('meal')).done(function(data){
                console.log(data);
                $("#rating").html("★".repeat(Math.round(data['stars']/data['number'])) + "<em>(" + data['number'] + " votes)</em>")
            });
        });
    }
});

(function(window,undefined){
    History.Adapter.bind(window,'statechange',function(){
        console.log(History.getState());
        if (History.getState()['data']['state'] == 0) {
            $(".fancybox").removeClass('selected');
            $("body").removeClass('meal-selected');
            $(".fancybox").click(function(event) {
                    //possibly: History.forward() instead (only here!)
                    History.pushState(1, "Mensadingsi: Rate meal", "?rate");
                    $(this).addClass('selected');
                    $("body").addClass('meal-selected');
                    $(this).off("click");
                    $("#rating").data('meal',$(this).text());
            });
        }
    });
    History.replaceState({state:0}, "Mensadingsi", "?home");

})(window);

});