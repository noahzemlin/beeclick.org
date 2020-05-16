var Game;
class GameClass {
    constructor() {
        this.honey = 0;
        this.upgrades = [];
        this.availableUpgrades = [];
        this.ownedUpgrades = [];
        this.era = "Honeycomb";
        this.eraChange = false;

        this.clickMultiplier = 1;
        this.ready = false;
    }

    clicky() {
        this.honey += this.clickMultiplier;
    }

    addHoney(honey) {
        if (Game.era == "Beetopia") {
            honey = honey * 100;
        }
        this.honey += honey;
    }

    checkForAvailableUpgrades() {
        for (var x in Game.upgrades) {
            x = Game.upgrades[x];
            if (Game.honey >= x.availablePrice && Game.availableUpgrades.indexOf(x.name) < 0) {
                // only make an upgrade available if we have:
                // - passed the honey threshold to unlock it, and
                // - it isn't already available
                Game.availableUpgrades.push(x.name)
                Game.upgrades[x.name].showing = 1;
            }
        }
    }

    getUpgradePurchasable(name) {
        var upgrade = Game.upgrades[name];

        if (upgrade.id < 5 && Game.era == "Super Factory") {
            // in this era, bees are dead. "Honeycomb"--"Farm" can't be bought
            return false;
        }

        if (upgrade.id >= 5 && upgrade.id <= 7 && Game.upgrades[Game.era].id >= Game.upgrades["Dont Lose Your Way"].id) {
            // after destroying synthetic processes to bring the bees back, "Synthetic Honey"--"Factories" can't be bought
            return false;
        }

        if (upgrade.id >= 8 && upgrade.count > 0) {
            // "Dont Lose Your Way" and "Beetopia" can each only be bought once
            return false;
        }

        if (Game.upgrades[Game.era].id < upgrade.id - 1) {
            // era names are also upgrade names, so we can use it as such for index checking.
            // can't skip an upgrade. must go in order to advance era
            // e.g., can't get "Apiary" if we are at "Honeycomb" (have not bought a "Hive")
            return false;
        }

        if (Game.honey >= upgrade.price) {
            // can only buy upgrades we can afford
            return true;
        }

        return false;
    }

    updatePrice(name) {
        // all upgrades that can be purchased more than once become 15% more expensive for each one that you already have
        if (Game.upgrades[name].id <= 7) {
            Game.upgrades[name].price = Math.ceil(Game.upgrades[name].baseprice * Math.pow(1.15, Game.upgrades[name].count));
            this.upgradesChanged = true;
        }
    }

    buyUpgrade(name) {
        if (Game.getUpgradePurchasable(name) && Game.honey >= Game.upgrades[name].price) {
            // can only buy things that are purchasable and that we can afford (redundant)
            Game.honey -= Game.upgrades[name].price;
            Game.upgrades[name].count += 1;
            Game.updatePrice(name);            
            this.upgradesChanged = true; //probably redundant

            if (Game.upgrades[name].id > Game.upgrades[Game.era].id) {
                // advance era to most recently bought upgrade
                Game.era = name;
                Game.eraChange = true;
            }

            if (Game.upgrades[name].id == 6) { // buying a "Humane Farm"
                // lose some random bee-related upgrades
                for (var upgradeIndex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeIndex];
                    if (upgrade.id <= 4 && Math.random() > 0.5) {
                        if (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                            Game.updatePrice(upgradeIndex);
                        }
                    }
                }
            }
            else if (Game.upgrades[name].id == 7) { // buying a "Super Factory"
                // lose all bee-related upgrades
                for (var upgradeIndex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeIndex];
                    if (upgrade.id <= 4) {
                        while (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                        }
                        Game.updatePrice(upgradeIndex);
                    }
                }
            }
            else if (Game.upgrades[name].id == 8) { // buying "Dont Lose Your Way"
                // lose all non-bee-related upgrades
                for (var upgradeIndex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeIndex];
                    if (upgrade.id >= 5 && upgrade.id<=7) {
                        while (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                        }
                        Game.updatePrice(upgradeIndex);
                    }
                }
            }
            else if (Game.upgrades[name].id == 9) { // buying "Beetopia"
                // set the click multiplier to 100
                this.clickMultiplier = 100;
            }

            updateDisplay();
        }
    }
}

var upgrade_id = 0;
class Upgrade {

    constructor(name, desc, price, availablePrice, earnRate, spritePos) {
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.baseprice = price;
        this.availablePrice = availablePrice;
        this.earnRate = earnRate;
        this.spritePos = spritePos;
        Game.upgrades[name] = this;

        this.count = 0;
        this.countshown = 0;
        this.showing = 0; //showing = 0 (not showing), 1 (needs to be added to the display), or 2 (already on the display)
        this.id = upgrade_id;
        this.purchasable = true;
        upgrade_id++;
    }

}

var enhancement_id = 0;
class Enhancement {

    constructor(name, desc, price, spritePos) {
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.spritePos = spritePos;
        Game.upgrades[name] = this;

        this.id = enhancement_id;
        enhancement_id++;
    }

}

//From the cookie clicker source code
var formatLong=[' thousand',' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
function formatEveryThirdPower(notations)
{
	return function (value)
	{
		var base = 0,
		notationValue = '';
		if (!isFinite(value)) return 'Infinity';
		if (value >= 1000000)
		{
			value /= 1000;
			while(Math.round(value) >= 1000)
			{
				value /= 1000;
				base++;
			}
			if (base >= notations.length) {return 'Infinity';} else {notationValue = notations[base];}
		} else {
            return value.toLocaleString();
        }
		return ( Math.round(value * 1000) / 1000 ) + notationValue;
	};
}

function beautifyHoney(value) {
    // represents total drops of honey in good notation using function above
    value = Math.round(value);
    return formatEveryThirdPower(formatLong)(value);
}

var lastHoneyValue = 0
var newHoneyValue = 0;
function updateDisplay() {
    // update total drops of honey displayed
    lastHoneyValue = newHoneyValue;
    newHoneyValue = Game.honey;
    $({ n: lastHoneyValue }).animate({ n: newHoneyValue}, {
        duration: 200,
        step: function(now, fx) {
            //$("div").append(now + "<br />");
            $("#honeyDisplay").html(beautifyHoney(now) + " drop" + (Game.honey == 1 ? "" : "s") + " of honey");
        }
    });

    // update the icon backgrounds depending on the era.
    // each panel is 512px wide by 64px tall. 8 panels per background. 3 different backgrounds.
    if (Game.eraChange) {
        Game.eraChange = false;
        if (Game.era == "Synthetic Honey") {
            $("#icons").css("background-position", "-512px 0px")
        }

        if (Game.upgrades[Game.era].id >= 6 && Game.upgrades[Game.era].id <= 8) {
            // "Humane Farm"--"Dont Lose Your Way"
            $("#icons").css("background-position", "-1024px 0px")
        }

        if (Game.era == "Beetopia") {
            $("#icons").css("background-position", "0px 0px")
            $("#icons").css("height", "320px");
        }

        if (Game.upgrades[Game.era].id <= 7) {
            // only show background panels up to the current era (furthest upgrade)
            $("#icons").css("height", Game.upgrades[Game.era].id * 64 + 64 + "px");
        }

        if (Game.upgrades[Game.era].id == 8) {
            $("#icons").css("height", "512px");
        }

    }

    Game.checkForAvailableUpgrades();

    for (var upgradeIndex in Game.upgrades) {
        var upgrade = Game.upgrades[upgradeIndex];
        var upgradehtml = $("#upgrade"+upgrade.id)
        if (upgrade.showing == 2) {
            // set text color depending if that upgrade can be bought currently
            if (!Game.getUpgradePurchasable(upgradeIndex)) {
                upgradehtml.attr("style", "color:#999;")
            }else{
                upgradehtml.attr("style", "")
            }

            // update displayed count of each upgrade
            if (upgrade.id >= 8) {
                // these upgrades are each a one-time-purchase
                upgradehtml.find("#upgradeCount"+upgrade.id).text(upgrade.name);
            } else {
                // these upgrades can be purchased multiple times, so show how many we currently have
                upgradehtml.find("#upgradeCount"+upgrade.id).text(upgrade.name + " (" + upgrade.count + ")");
            }

            // update the displayed price of each upgrade
            upgradehtml.find("#upgradePrice"+upgrade.id).text(Number(upgrade.price).toLocaleString());

            // add the upgrade sprite to the icons section in the middle
            if (upgrade.countshown < upgrade.count && upgrade.id <= 7) { //upgrade.id <= 7 to exclude redemption arc
                while (upgrade.countshown < upgrade.count) {
                    upgrade.countshown++;
                    // figure out how much space we have 
                    var iconFrameWidth = screen.width * 0.3 * 0.9;
                    // use some randomness so the icons are staggered as they appear left to right in their respective panel
                    var left = Math.round(Math.random() * 3 - 1.5 + upgrade.countshown * 30 - 30) % (iconFrameWidth - 42);
                    // % will loop the icons and keep them from going off the page to the right if a lot are bought.
                    // (width of panel is 512px but each sprite is ~48px wide)
                    var top = Math.round(5 + Math.random() * 8 - 4 + upgrade.id * 64);
                    $("#icons").append(
                        "<div class='upgradeFake' id='upgradeFake" + upgrade.id +"" + upgrade.count + "' style='position:absolute; left: " + left + "px; top: " + top + "px; background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div>"
                    )
                }
            }
        }

        // add the upgrade as a displayed purchase option for the first time
        if (upgrade.showing == 1) {
            var newRow = $("<tr id='upgrade" + upgrade.id + "' style='color:#999;'>"
                +"<td><div class='upgrade' title = \"" + upgrade.desc + "\" onclick='Game.buyUpgrade(\"" + upgrade.name + "\")' style='background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div></td>"
                +"<td id='upgradeCount" + upgrade.id + "'>" + upgrade.name + " (" + upgrade.count + ")</td>"
                +"<td class='currency' id='upgradePrice" + upgrade.id + "'>" + Number(upgrade.price).toLocaleString() + "</td>"
                +"</tr>");

            $("#upgradesTable").append(newRow);
            upgrade.showing = 2;

            $("#upgradesTable tr *").qtip({
                style: {
                    classes: 'myTips'
                },
                position: {
                    my: 'bottom right',  // Position my top left...
                    at: 'top left', // at the bottom right of...
                }
            })
        }
    }

}


function setupBigBee() {
    // make sprite bigger while mouse is hovering over it
    $("#BerryBeeBenson").hover(
        function(){$(this).animate({width: "70%", height:"70%"}, 100);},        
        function(){$(this).animate({width: "60%", height:"60%"}, 100);}
    );
    // make sprite bigger when clicked, and call the clicky() function to add honey
    $("#BerryBeeBenson").click(
        function(){
            $(this).animate({width: "70%", height:"70%"}, 50, "swing", $(this).animate({width: "80%", height:"80%"}, 50));
            Game.clicky();
            //updateDisplay();
        }
    );
}

// runs on the global timer.
function loop() {
    // run the autoplay if it is enabled
    if (runAutoplay) {
        autoplay();
    }
    // add passive honey from all the upgrades.
    var honeyToAdd = 0;
    for (var x in Game.upgrades) {
        var upgrade = Game.upgrades[x];
        honeyToAdd += upgrade.earnRate * upgrade.count;
    }
    Game.addHoney(honeyToAdd/5.0);
    updateDisplay();
}

// restore data from saved cache (user can close and reopen and it won't reset)
function readSave() {
    if(localStorage.key("save")) {
        Game.honey = Number(localStorage.getItem("honey"));
        Game.era = localStorage.getItem("era");
        for (x in Game.upgrades) {
            Game.upgrades[x].count = Number(localStorage.getItem(x));
        }

        Game.eraChange = true;
        updateDisplay();
    }
    Game.ready = true;
}

function resetProgress() {
    if (confirm("Reset all progress?")) {
        localStorage.clear();
        location.reload();
    }
}

function factloop() {
    var eraToRead = "Facts";
    
    // decide whether to show era-specific info other than neutral facts
    if  (Math.random() > .6) {
        if (Game.upgrades[Game.era].id <= 3 || Game.upgrades[Game.era].id>=9) {
            eraToRead = "pre-synth";
        }
        else if (Game.upgrades[Game.era].id == 4 || Game.upgrades[Game.era].id==8) {
            eraToRead = "post-synth";
        }
        else {
            eraToRead = "post-genocide";
        }
    }
    // randomly choose a fact to display
    var factsHTML = $("#facts")
    factsHTML.fadeOut(500, 
        function() {
            factsHTML.text(facts[eraToRead][Math.floor(Math.random() * facts[eraToRead].length)]);
            factsHTML.fadeIn(500);
        });
    // backup game data localStorage
    localStorage.setItem("save", true);
    localStorage.setItem("honey", Game.honey);
    localStorage.setItem("era", Game.era);
    for (x in Game.upgrades) {
        localStorage.setItem(x, Game.upgrades[x].count);
    }
}

//Pre-main: define Game and all the upgrades

Game = new GameClass();
// name, desc, price, availablePrice, earnRate, spritePos
new Upgrade("Honeycomb", "Your first couple of bees.", 15, 1, 1, [0,0]);
new Upgrade("Hive", "Stop stealing their honey for a second and maybe they'll make a hive.", 100, 20, 5, [1,0]);
new Upgrade("Apiary", "You found out you can combine multiple hives into one to improve effeciency.", 350, 150, 15, [2,0]);
new Upgrade("Sanctuary", "But what if we combined multiple apiaries together?", 1000, 400, 70, [3,0]);
new Upgrade("Farm", "OK, now this is going a bit far.", 2000, 1250, 150, [4,0]);
new Upgrade("Synthetic Honey", "A technological breakthrough allows you to create honey without the need for bees at all.", 5000, 2250, 500, [5,0]);
new Upgrade("Humane Farm", "By crushing old bees, you find that you can extract extra bits of honey out of them.</br><b>Your old bee ways will be replaced with superior technology.</b>",20000 , 12500, 1000, [6,0]);
new Upgrade("Super Factory", "These super factories completely elimate the need for bees.</br><b>Bees will no longer be needed for anything.</b>", 200000, 122500, 2500, [7,0]);
new Upgrade("Dont Lose Your Way", "On the brink of world collapse, you find a few remaining bees in one of your Humane Farms.</br><b>You can bring them back, but you'll have to destroy your synthetic progress</b>", 10, 1000000, 0, [8,0]);
new Upgrade("Beetopia", "The bees are back, and they love you.</br><b>You notice that the bees are producing more than ever before.</b>", 10000000, 5000000, 0, [9,0]);
//NOTE: putting in the apostrophe in "Don't Lose Your Way" breaks everything. Leave it out.

// setup hotkeys to control the game with the keyboard
$(document).keypress(function() {
    if (!Game.ready) { return; }

    if (event.which == 13 || event.which == 32) {  // enter or spacebar
        Game.clicky();
    } else if (event.which == 48 || event.which == 96) { // 0 or numpad 0
        Game.buyUpgrade("Honeycomb");
    } else if (event.which == 49 || event.which == 97) { // 1
        Game.buyUpgrade("Hive");
    } else if (event.which == 50 || event.which == 98) { // 2
        Game.buyUpgrade("Apiary");
    } else if (event.which == 51 || event.which == 99) { // 3
        Game.buyUpgrade("Sanctuary");
    } else if (event.which == 52 || event.which == 100) { // 4
        Game.buyUpgrade("Farm");
    } else if (event.which == 53 || event.which == 101) { // 5
        Game.buyUpgrade("Synthetic Honey");
    } else if (event.which == 54 || event.which == 102) { // 6
        Game.buyUpgrade("Humane Farm");
    } else if (event.which == 55 || event.which == 103) { // 7
        Game.buyUpgrade("Super Factory");
    } else if (event.which == 56 || event.which == 104) { // 8
        Game.buyUpgrade("Dont Lose Your Way");
    } else if (event.which == 57 || event.which == 105) { // 9
        Game.buyUpgrade("Beetopia");
    }
});

//Main
$(document).ready(function(){

    setupBigBee();
    readSave();
    factloop()

    GlobalTimer=setInterval(loop,200);
    FactTimer=setInterval(factloop,10000);
});