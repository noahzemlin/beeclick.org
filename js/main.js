class Game {
    constructor() {
        this.honey = 0;
    }

    clicky() {
        this.honey = this.honey + 1;
    }
}

function updateHoneyDisplay() {
    $("#honeyDisplay").text("Honey: " + Game.honey);
}

function setupBigBee() {
    $("#BerryBeeBenson").hover(
        function(){$(this).animate({width: "70%", height:"70%"}, 100);},        
        function(){$(this).animate({width: "60%", height:"60%"}, 100);}
    );

    $("#BerryBeeBenson").click(
        function(){
            $(this).animate({width: "70%", height:"70%"}, 50, "swing", $(this).animate({width: "80%", height:"80%"}, 50));
            Game.clicky();
            updateHoneyDisplay();
        }
    );
}

//Main
$(document).ready(function(){
    Game = new Game();
    setupBigBee();
});