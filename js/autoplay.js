// functions for automatically playing bee clicker

var runAutoplay = false;
function autoplayPress() {
    runAutoplay = !runAutoplay;
}

var gamePhase = 1; 
// phase 1 = buy available upgrades prior to "Dont Lose Your Way".
// phase 2 = once we have at least 10 "Super Factory", save money to afford "Don't Lose Your Way" and "Beetopia".
// phase 3 = buy "Don't Lose Your Way" and "Beetopia".
// phase 4 = we are in Beetopia era. buy all available upgrades.
function autoplay() {
    // click the bee
    //jQuery.event.trigger({ type: 'keypress', which: 32 }); //spacebar
    Game.honey += Game.clickMultiplier;

    // check and update gamePhase
    if (gamePhase == 1 && Game.upgrades["Super Factory"].count >= 10) {
        gamePhase = 2;
    } else if (gamePhase == 2 && Game.honey >= 10000010) {
        gamePhase = 3;
    } else if (gamePhase == 3 && Game.upgrades["Dont Lose Your Way"].count > 0 && Game.upgrades["Beetopia"].count > 0) {
        gamePhase = 4;
    }

    // do actions based on the phase we are in
    switch(gamePhase) {
        case 1:
            // buy each available upgrade (except "Dont Lose Your Way").
            for (var x in Game.upgrades) {
                //upgrade = Game.upgrades[x];
                if (Game.upgrades[x].id < 8 && Game.getUpgradePurchasable(x)){
                    Game.buyUpgrade(x);
                    //jQuery.event.trigger({ type: 'keypress', which: Game.upgrades[x].id + 48 });
                }
            }
            break;
        case 2:
            // save money to be able to afford "Dont Lose Your Way" and "Beetopia".
            // do nothing so honey can accumulate.
            break;
        case 3:
            // buy "Don't Lose Your Way".
            if (Game.getUpgradePurchasable("Dont Lose Your Way")){
                Game.buyUpgrade("Dont Lose Your Way");
                //jQuery.event.trigger({ type: 'keypress', which: Game.upgrades["Dont Lose Your Way"].id + 48 });
            }
            // buy "Beetopia"
            if (Game.getUpgradePurchasable("Beetopia")){
                Game.buyUpgrade("Beetopia");
                //jQuery.event.trigger({ type: 'keypress', which: Game.upgrades["Beetopia"].id + 48 });
            }
            break;
        case 4:
            // we are in Beetopia! buy all available upgrades forever.
            for (var x in Game.upgrades) {
                //upgrade = Game.upgrades[x];
                if (Game.upgrades[x].id < 8 && Game.getUpgradePurchasable(x)){
                    Game.buyUpgrade(x);
                    //jQuery.event.trigger({ type: 'keypress', which: Game.upgrades[x].id + 48 });
                }
            }
            break;
    }
}