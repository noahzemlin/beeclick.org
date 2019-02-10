var Game;
class GameClass {
    constructor() {
        this.honey = 0;
        this.upgrades = [];
        this.availableUpgrades = [];
        this.ownedUpgrades = [];
        this.era = "Honeycomb";
        this.eraChange = false;

        this.clickmultiplier = 0;
    }

    clicky() {
        if (Game.era == "Beetopia") {
            this.honey += 100
        }
        else {
            this.honey += 1;
        }
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
                Game.availableUpgrades.push(x.name)
                Game.upgrades[x.name].showing = 1;
            }
        }
    }

    getUpgradePurchasable(name) {
        var upgrade = Game.upgrades[name];

        if (upgrade.id < 5 && Game.era == "Super Factories") {
            return false;
        }

        if (upgrade.id >= 5 && upgrade.id <= 7 && Game.upgrades[Game.era].id >= Game.upgrades["Dont lose your way"].id) {
            return false;
        }

        if (upgrade.id >= 8 && upgrade.count > 0) {
            return false;
        }

        if (Game.upgrades[Game.era].id < upgrade.id - 1) {
            return false;
        }

        if (Game.honey >= upgrade.price) {
            return true;
        }

        return false;
    }

    updatePrice(name) {
        if (Game.upgrades[name].id <= 7) {
            Game.upgrades[name].price = Math.ceil(Game.upgrades[name].baseprice * Math.pow(1.15, Game.upgrades[name].count));
            this.upgradesChanged = true;
        }
    }

    buyUpgrade(name) {
        if (Game.getUpgradePurchasable(name) && Game.honey >= Game.upgrades[name].price) {
            Game.honey -= Game.upgrades[name].price;
            Game.upgrades[name].count += 1;
            Game.updatePrice(name);            
            this.upgradesChanged = true;

            if (Game.upgrades[name].id > Game.upgrades[Game.era].id) {
                Game.era = name;
                Game.eraChange = true;
            }

            if (Game.upgrades[name].id == 6) {
                for (var upgradeindex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeindex];
                    if (upgrade.id <= 4 && Math.random() > 0.5) {
                        if (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                            Game.updatePrice(upgradeindex);
                        }
                    }
                }
            }

            if (Game.upgrades[name].id == 7) {
                for (var upgradeindex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeindex];
                    if (upgrade.id <= 4) {
                        while (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                        }
                        Game.updatePrice(upgradeindex);
                    }
                }
            }

            if (Game.upgrades[name].id == 8) {
                for (var upgradeindex in Game.upgrades) {
                    var upgrade = Game.upgrades[upgradeindex];
                    if (upgrade.id >= 5 && upgrade.id<=7) {
                        while (upgrade.count > 0) {
                            $("#upgradeFake"+upgrade.id+""+upgrade.count).remove();
                            upgrade.count--;
                            upgrade.countshown--;
                        }
                        Game.updatePrice(upgradeindex);
                    }
                }
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
        this.showing = 0;
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
    value = Math.round(value);
    return formatEveryThirdPower(formatLong)(value);
}

var lastHoneyValue = 0
var newHoneyValue = 0;
function updateDisplay() {
    //Nice honey lerp
    lastHoneyValue = newHoneyValue;
    newHoneyValue = Game.honey;
    $({ n: lastHoneyValue }).animate({ n: newHoneyValue}, {
        duration: 200,
        step: function(now, fx) {
            //$("div").append(now + "<br />");
            $("#honeyDisplay").html(beautifyHoney(now) + " drop" + (Game.honey == 1 ? "" : "s") + " of honey");
        }
    });

    if (Game.eraChange) {
        Game.eraChange = false;
        if (Game.era == "Synthetic Honey") {
            $("#icons").css("background-position", "-512px 0px")
        }

        if (Game.upgrades[Game.era].id >= 6 && Game.upgrades[Game.era].id <= 8) {
            $("#icons").css("background-position", "-1024px 0px")
        }

        if (Game.era == "Beetopia") {
            $("#icons").css("background-position", "0px 0px")
            $("#icons").css("height", "320px");
        }

        if (Game.upgrades[Game.era].id <= 7) {
            $("#icons").css("height", Game.upgrades[Game.era].id * 64 + 64 + "px");
        }

        if (Game.upgrades[Game.era].id == 8) {
            $("#icons").css("height", "512px");
        }

    }

    Game.checkForAvailableUpgrades();

    for (var upgradeindex in Game.upgrades) {
        var upgrade = Game.upgrades[upgradeindex];
        var upgradehtml = $("#upgrade"+upgrade.id)
        if (upgrade.showing == 2) {
            //if we can buy
            if (!Game.getUpgradePurchasable(upgradeindex)) { //if (Game.honey < upgrade.price && if ()) {
                upgradehtml.attr("style", "color:#999;")
            }else{
                upgradehtml.attr("style", "")
            }
            if (upgrade.id >= 8) {
                upgradehtml.find("#upgradeCount"+upgrade.id).text(upgrade.name);
            } else {
                upgradehtml.find("#upgradeCount"+upgrade.id).text(upgrade.name + " (" + upgrade.count + ")");
            }
            upgradehtml.find("#upgradePrice"+upgrade.id).text(Number(upgrade.price).toLocaleString());
            if (upgrade.countshown < upgrade.count && upgrade.id <= 7) { //upgrade.id <= 7 to exclude redemption arc
                while (upgrade.countshown < upgrade.count) {
                    upgrade.countshown++;
                    var left = Math.random() * 3 - 1.5 + upgrade.countshown * 30 - 30;
                    var top = 5 + Math.random() * 8 - 4 + upgrade.id * 64;
                    $("#icons").append(
                        "<div class='upgradeFake' id='upgradeFake" + upgrade.id +"" + upgrade.count + "' style='position:absolute; left: " + Math.round(left) + "px; top: " + Math.round(top) + "px; background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div>"
                    )
                }
            }
        }

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
    $("#BerryBeeBenson").hover(
        function(){$(this).animate({width: "70%", height:"70%"}, 100);},        
        function(){$(this).animate({width: "60%", height:"60%"}, 100);}
    );

    $("#BerryBeeBenson").click(
        function(){
            $(this).animate({width: "70%", height:"70%"}, 50, "swing", $(this).animate({width: "80%", height:"80%"}, 50));
            Game.clicky();
            //updateDisplay();
        }
    );
}


function loop() {
    var honeyToAdd = 0;
    for (var x in Game.upgrades) {
        var upgrade = Game.upgrades[x];
        honeyToAdd += upgrade.earnRate * upgrade.count;
    }
    Game.addHoney(honeyToAdd/5.0);
    updateDisplay();
}

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
}

function factloop() {
    var eraToRead = "Facts";
    
    //Show something other than facts
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

    var factsHTML = $("#facts")
    factsHTML.fadeOut(500, 
        function() {
            factsHTML.text(facts[eraToRead][Math.floor(Math.random() * facts[eraToRead].length)]);
            factsHTML.fadeIn(500);
        });

    localStorage.setItem("save", true);
    localStorage.setItem("honey", Game.honey);
    localStorage.setItem("era", Game.era);
    for (x in Game.upgrades) {
        localStorage.setItem(x, Game.upgrades[x].count);
    }
}

//Pre-main

Game = new GameClass();
// name, desc, price, availablePrice, earnRate, spritePos
new Upgrade("Honeycomb", "Your first couple of bees.", 15, 1, 1, [0,0]);
new Upgrade("Hive", "Stop stealing their honey for a second and maybe they'll make a hive.", 100, 20, 5, [1,0]);
new Upgrade("Apiary", "You found out you can combine multiple hives into one to improve effeciency.", 350, 150, 15, [2,0]);
new Upgrade("Sanctuary", "But what if we combined multiple apiaries together?", 1000, 400, 70, [3,0]);
new Upgrade("Farm", "OK, now this is going a bit far.", 2000, 1250, 150, [4,0]);
new Upgrade("Synthetic Honey", "A technological breakthrough allows you to create honey without the need for bees at all.", 5000, 2250, 500, [5,0]);
new Upgrade("Humane Farm", "By crushing old bees, you find that you can extract extra bits of honey out of them.</br><b>Your old bee ways will be replaced with superior technology.</b>",20000 , 12500, 1000, [6,0]);
new Upgrade("Super Factories", "These super factories completely elimate the need for bees.</br><b>Bees will no longer be needed for anything.</b>", 200000, 122500, 2500, [7,0]);
new Upgrade("Dont lose your way", "On the brink of world collapse, you find a few remaining bees in one of your Humane Farms.</br><b>You can bring them back, but you'll have to destroy your synthetic progress</b>", 10, 1000000, 0, [8,0]);
new Upgrade("Beetopia", "The bees are back, and they love you. The grass is green, and things are good.</br><b>You notice that the bees are producing more than ever before.</b>", 10000000, 5000000, 0, [9,0]);

//Main
$(document).ready(function(){

    setupBigBee();
    readSave();
    factloop()

    GlobalTimer=setInterval(loop,200);
    FactTimer=setInterval(factloop,8000);
});