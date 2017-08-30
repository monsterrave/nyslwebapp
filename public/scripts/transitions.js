$(function() {
    //bs accordion
     $('.collapse').on('show.bs.collapse', function() {
        $('#accordion .collapse').removeClass('in');
    });
     
    //page swaps by navbar
    $("nav.navbar a, #page-index .btn").bind('click', function(e) {
        /* console.log('clicked link')*/
        $("#js-bootstrap-offcanvas").trigger("offcanvas.close");
        e.preventDefault();
        console.log(e)
        var nextPage = $(e.target.hash);
       /* console.log(nextPage)*/
        $("#pages .current").removeClass("current");
        nextPage.addClass("current");
    });

    // //page swaps by buttons in #page-index
    // $("#page-index a").bind('click', function(e) {
    //     /*console.log('clicked link')*/
    //     e.preventDefault();
    //     var nextPage = $(e.target.hash);
    //     $("#pages .current").removeClass("current");
    //     nextPage.addClass("current");
    // });

    //transitions
    // var fromPage = $("#page-index"),
    //     toPage = $("#page-schedule");
    //     console.log(fromPage,toPage)

    // $("nav #page-schedule a").click(function() {
    //     console.log('clicked link');
    //     toPage.addClass("current fade in");
    //     console.log(toPage);
    //     fromPage.addClass("fade out");
    //     console.log(fromPage);
    // });

    // $('nav #page-schedule a').click(function() {
    //     $('#page-schedule').fadeIn(3000);
    // });

    /*//ansatz for landscape mode?
    if(window.innerWidth > window.innerHeight) {
           $('#page-schedule').css("background-color", "yellow");
    }*/
});