var Game;
class GameClass {
    constructor() {
        this.honey = 0;
        this.upgrades = [];
        this.availableUpgrades = [];
        this.ownedUpgrades = [];
    }

    clicky() {
        this.honey += 1;
    }

    addHoney(honey) {
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

    buyUpgrade(name) {
        if (Game.honey >= Game.upgrades[name].price) {
            Game.honey -= Game.upgrades[name].price;
            Game.upgrades[name].count += 1;
            Game.upgrades[name].price = Math.ceil(Game.upgrades[name].price * 1.15 );
            this.upgradesChanged = true;
            updateDisplay();
        }
    }
}
var id = 0;
class Upgrade {

    constructor(name, desc, price, availablePrice, earnRate, spritePos) {
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.availablePrice = availablePrice;
        this.earnRate = earnRate;
        this.spritePos = spritePos;
        Game.upgrades[name] = this;

        this.count = 0;
        this.countshown = 0;
        this.showing = 0;
        this.id = id;
        id++;
    }

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
            $("#honeyDisplay").text(Math.round(now) + " drop" + (Game.honey == 1 ? "" : "s") + " of honey");
        }
    });


    Game.checkForAvailableUpgrades();

    for (var upgradeindex in Game.upgrades) {
        var upgrade = Game.upgrades[upgradeindex];
        var upgradehtml = $("#upgrade"+upgrade.id)
        if (upgrade.showing == 2) {
            if (Game.honey < upgrade.price) {
                upgradehtml.attr("style", "color:#999;")
            }else{
                upgradehtml.attr("style", "")
            }
            upgradehtml.find("#upgradeCount"+upgrade.id).text(upgrade.name + " (" + upgrade.count + ")");
            upgradehtml.find("#upgradePrice"+upgrade.id).text(upgrade.price);
            if (upgrade.countshown < upgrade.count) {
                while (upgrade.countshown < upgrade.count) {
                    upgrade.countshown++;
                    var left = Math.random() * 3 - 1.5 + upgrade.countshown * 30 - 30;
                    var top = 190 + Math.random() * 8 - 4 + upgrade.id * 60;
                    $("#icons").append(
                        "<div class='upgrade' style='position:absolute; left: " + Math.round(left) + "px; top: " + Math.round(top) + "px; background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div>"
                    )
                }
            }
        }

        if (upgrade.showing == 1) {
            var tableStr = $("#upgradesTable").html();
            tableStr += "<tr id='upgrade" + upgrade.id + "' style='color:#999;'>"
                +"<td><div class='upgrade' onclick='Game.buyUpgrade(\"" + upgrade.name + "\")' style='background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div></td>"
                +"<td id='upgradeCount" + upgrade.id + "'>" + upgrade.name + " (" + upgrade.count + ")</td>"
                +"<td class='currency' id='upgradePrice" + upgrade.id + "'>" + upgrade.price + "</td>"
                +"</tr>";
            upgrade.showing = 2;
            $("#upgradesTable").html(tableStr);
        }
    }

    $("#upgradesTable").html(tableStr);
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
            updateDisplay();
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

function factloop() {
    var factsHTML = $("#facts")
    factsHTML.fadeOut(500, 
        function() {
            factsHTML.text(facts["Facts"][Math.floor(Math.random() * facts["Facts"].length)]);
            factsHTML.fadeIn(500);
        });
}

//Pre-main

Game = new GameClass();
// name, desc, price, availablePrice, earnRate, spritePos
new Upgrade("Honeycomb", "Literally just honeycombs", 15, 1, 1, [0,0]);
new Upgrade("Hive", "Buzz max", 100, 20, 5, [1,0]);
new Upgrade("Apiary", "many buzz", 350, 150, 15, [2,0]);
new Upgrade("Sanctuary", "many many many buzz", 1000, 400, 70, [3,0]);
new Upgrade("Farm", "mega buzz", 2000, 1250, 150, [4,0]);
new Upgrade("Synthetic Honey", "Omega buzz", 5000, 2250, 500, [5,0]);
new Upgrade("Humane Farm", "Omega good buzz",20000 , 6250, 1000, [6,0]);
new Upgrade("Super Factories", "Omega great buzz", 200000, 122500, 2500, [7,0]);

//Main
$(document).ready(function(){
    setupBigBee();
    factloop()

    GlobalTimer=setInterval(loop,200);
    FactTimer=setInterval(factloop,8000);
});