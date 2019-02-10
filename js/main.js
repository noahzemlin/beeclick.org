var Game;
class GameClass {
    constructor() {
        this.honey = 0;
        this.upgrades = [];
        this.availableUpgrades = [];
        this.ownedUpgrades = [];
        this.upgradesChanged = false;
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
            console.log("checking " + x)
            if (Game.honey >= x.availablePrice && Game.availableUpgrades.indexOf(x.name) < 0) {
                Game.availableUpgrades.push(x.name)
                this.upgradesChanged = true;
            }
        }
    }

    buyUpgrade(name) {
        if (Game.honey >= Game.upgrades[name].price) {
            Game.honey -= Game.upgrades[name].price;
            Game.upgrades[name].count += 1;
            Game.upgrades[name].price = Math.ceil(Game.upgrades[name].price * 1.15 );
            this.upgradesChanged = true;
            updateHoneyDisplay();
        }
    }
}

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
    }

}

function updateHoneyDisplay() {
    $("#honeyDisplay").text("Honey: " + Math.round(Game.honey));
    Game.checkForAvailableUpgrades();

    if (Game.upgradesChanged){
        Game.upgradesChanged = false;
        var tableStr = "";
        for (var upgradeindex in Game.availableUpgrades) {
            var upgrade = Game.upgrades[Game.availableUpgrades[upgradeindex]];
            
            tableStr += "<tr>"
                +"<td><div class='upgrade' onclick='Game.buyUpgrade(\"" + upgrade.name + "\")' style='background-position: -" + upgrade.spritePos[0] * 48 + "px -" +  + upgrade.spritePos[1] * 48 + "px;'></div></td>"
                +"<td>" + upgrade.name + " (" + upgrade.count + ")</td>"
                +"<td class='currency'>" + upgrade.price + "</td>"
                +"</tr>";
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
            updateHoneyDisplay();
        }
    );
}

function buzz() {
    $("#BerryBeeBenson").attr("src","img/bee2.png");
    setTimeout(function(){$("#BerryBeeBenson").attr("src","img/bee1.png");}, 200);
}

function loop() {
    var honeyToAdd = 0;
    for (var x in Game.upgrades) {
        var upgrade = Game.upgrades[x];
        honeyToAdd += upgrade.earnRate * upgrade.count;
    }
    Game.addHoney(honeyToAdd/5.0);
    updateHoneyDisplay();
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

    GlobalTimer=setInterval(loop,200);
    BuzzTimer=setInterval(buzz,5000);
});