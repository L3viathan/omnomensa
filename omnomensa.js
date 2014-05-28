String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

function getMeals() {
    $(".meals").empty();
    $(".day").removeClass('day-selected');
    $.ajax({
        url: "http://mensaproxy.l3vi.de/de/Essen/Essen-in-Saarbrucken/Speiseplan-aktuell",
        dataType: "text",
        success: function(data) {
            var day = $('.days').data("day") ? $('.days').data("day") : parseInt(/today = '(\d)'/.exec(data)[1]) + 1;
            var elements = $("<div>").html(data).find(".tab:nth-child(" + day + ") .desc");
            var anything = false;
            elements.each(function(){
                elem = $(this).text().replace(/\s+\d+(,\d+)*\s*$/g, '').replace(/,.+/g, '').replace("mensaVital: ","").replace("Tagesessen: ","").replace("ZIS Spezialitätentag ","").replace("Vegan: ","").replace('( ','(').replace(' )',')').replace(/Büffet.+$/g,'Büffet').replace(/Heute für Sie.+$/,"Salatbüffet").replace(/täglich wechselnd.+$/,"Salatbüffet").trim();
                var price = $(this).prev().children('.price:first-child').text();
                anything = true;
                $.post('http://api.l3vi.de/mensa.json', 'rating=0&meal='+elem).done(function(rating_data){
                    if (rating_data['number'] == 0) {
                        rating_data['number'] = 1;
                    }
                    if (rating_data['meta']) {
                        meta = "meta";
                    }
                    else {
                        meta = "fancybox";
                    }

                    var maybeprice = '<span class="price">' + (price ? price : 'N/A') + '</span>';
                    $(".meals").append('<li class="' + meta + '"><div class="item"><span class="name">'+rating_data['name']+' </span> <div class="meal-all-stars"><span class="meal-stars"> ' + "★".repeat(Math.round(rating_data['stars']/rating_data['number'])) + '</span><span class="meal-stars-black">' + (rating_data['stars'] != 0 ? "★".repeat(5-Math.round(rating_data['stars']/rating_data['number'])) : '') + '</span>' + maybeprice + '</div></div></li>');
                    $(".fancybox").click(function(event) {
                        History.pushState({state:1}, "Mensadingsi: Rate meal", "?rate");
                        $(this).addClass('selected');
                        $("body").addClass('meal-selected');
                        $(this).off("click");
                        $("#rating").data('meal',$(this).find(".name").text());
                    });
                });
            });
            if(!anything) {
                $(".meals").append('<span class="message">Go eat somewhere else today</span>');
            }
            $("#rating span").click(function(event) {
                $("#rating span").off("click");
                $.post('http://api.l3vi.de/mensa.json', 'rating=' + $(this).attr('id') + '&meal=' + $("#rating").data('meal')).done(function(data){
                    $("#rating").html("★".repeat(Math.round(data['stars']/data['number'])) + "<em>(" + data['number'] + " votes)</em>")
                });
            });
            $("#day-"+day).addClass('day-selected');
        }
    });
}

$(function(){
    
$('.meals li').click(function(event) {
    /* Act on the event */
    $(self).addClass('selected');
    $("body").addClass('meal-selected');
});

getMeals();

(function(window,undefined){
    History.Adapter.bind(window,'statechange',function(){
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

$(".day").click(function(event) {
    $(".days").data("day",parseInt($(this).attr('id').slice(-1)));
    getMeals();
});

});