var cards = {
  smite: {name: "smite", type: "attack", cost: 1, description: "deal 5 damage", image: "smite.png"},
  block: {name: "block", type: "skill", cost: 1, description: "gain 5 block", image: "block.png"},
  draw: {name: "draw", type: "skill", cost: 1, description: "draw 2 cards", image: "draw.png"},
  heal: {name: "heal", type: "skill", cost: 1, description: "restore 5 health", image: "heal.png"},
  dash: {name: "dash", type:"attack", cost: 2, description: "deal 5 damage, draw one card, costs 0 if the last card you played was a skill", image: "dash.png"},
  flame: {name: "flame", type: "skill", cost: 1, description: "apply fire", image: "flame.png"},
  smear: {name: "smear", type: "attack", cost: 2, description: "deal 5 damage, poision target", image: "smear.png"},
  grow: {name: "grow", type: "skill", cost: 2, description: "restore 2 health for each card you played this turn", image:"grow.png"},
  fortune: {name: "fortune", type: "attack", cost: 2, description: "25% change to deal 5 damage, 25% change to deal 15 damage, 50% change to deal 10 damage", image: "fortune.png"},
  spirit: {name: "spirit", type: "skill", cost: 0, description: "gain 1 energy", image: "spirit.png"},
  cleanse: {name: "cleanse", type: "skill", cost: 0, description: "remove all status effects", image: "cleanse.png"},
  chain: {name: "chain", type: "skill", cost: 2, description: "draw cards until your hand is full", image: "chain.png"},
  club: {name: "club", type: "attack", cost: 0, description: "deal 10 damage if you have no other cards in your hand", image: "club.png"},
  fortify: {name: "fortify", type: "skill", cost: 0, description: "if you have 5 or more block, gain 5 block", image: "fortify.png"},
  blankCard: {name: "none", type: "none", cost: 0, description: "", image: ""},
};

var bossAttacks = [
  {name: "strike", description: "deal 10 damage"}, 
  {name: "slash", description: "deals 5 damage, poisions target"},
  {name: "reinforce", description: "deal 10 damage, gain 10 block"},
];

var statusEffects = {
  poison: {name: "poison", color: "🟢", turn: 3},
  fire: {name: "fire", color: "🔴", turn: 3},
};

var deck = [];
var hand = [cards.blankCard,cards.blankCard,cards.blankCard, cards.blankCard];
var discard = [];
var players = {
  "boss":{health: 80, shield: 0, status:[]},
  "player": {health: 20, shield: 0, status: [], lastCard: "",cardsPlayed: 0, energy: 0},
};
var isPlayerTurn = true;
var turns = 0;

//-----------------------------------------------------------------------------------
//setters
function setDeck() {
  setProperty("deck","text",deck.length);
}
function setDiscard() {
  setProperty("discard", "text", discard.length);
}
function setPlayerShield(shield) {
  if(shield == 0) {
    players["player"].shield = shield;
    hideElement("player_shield");
  } else {
    showElement("player_shield");
    players["player"].shield = shield;
    setProperty("player_shield", "text", players["player"].shield);
  }
}
function setBossShield(shield) {
  if(shield == 0) {
    players["boss"].shield = shield;
    hideElement("boss_shield");
  } else {
    showElement("boss_shield");
    players["boss"].shield = shield;
    setProperty("boss_shield", "text", players["boss"].shield);
  }
}
function setBossHealth(health) {
  if(players["boss"].health < health) {
    players["boss"].health = health;
    setProperty("bossHealth", "text", players["boss"].health + "/80");
  } else {
    if((players["boss"].shield - (players["boss"].health - health)) >= 0) {
      setBossShield(players["boss"].shield - (players["boss"].health - health));
    } else {
      players["boss"].health = ((players["boss"].shield + players["boss"].health) - (players["boss"].health - health));
      setBossShield(0);
      setProperty("bossHealth", "text", players["boss"].health + "/80"); 
    }
  }
}
function setPlayerHealth(health) {
  if(players["player"].health < health) {
    players["player"].health = health;
    setProperty("playerHealth", "text", players["player"].health + "/50");
  } else {
    if((players["player"].shield - (players["player"].health - health)) >= 0) {
      setPlayerShield(players["player"].shield - (players["player"].health - health));
    } else {
      players["player"].health = ((players["player"].shield + players["player"].health) - (players["player"].health - health));
      setPlayerShield(0);
      setProperty("playerHealth", "text", players["player"].health + "/50"); 
    }
  }
}
function setEnergy( energy) {
  players["player"].energy = energy;
  setProperty("player_energy","text",players["player"].energy);
}

//---------------------------------------------------------------------------------------------------------__
//general methods

//suffles an array
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//returns [arr1,arr2]
function merge(arr1, arr2) {
  var result = [];
  for(var i=0; i<arr1.length; i++) {
    result.push(arr1[i]);
  }
  for(var j=0; j<arr2.length; j++) {
    result.push(arr2[j]);
  }
  return result;
}

function useCard(cardIdx, cardId) {
  if((players["player"].energy - cardId.cost) < 0) {
    setProperty("action", "text", "not enough energy!");
    return;
  }
  players["player"].cardsPlayed++;
  var temp = hand.splice(cardIdx,1);
  hand.push(cards.blankCard);
  try {
  window[cardId.name]();
  discard.push(temp[0]);
  }
  catch(err) {
    console.log("yo yo yo");
  }
  players["player"].lastCard = cardId.type;
  updateHand();
  setDeck();
  setDiscard();
}

function checkLifePoints() {
  if((players["boss"].health <= 0)) {
    setProperty("game_decide","text","You Win");
    setProperty("game_decide","text-color","#00f1ff");
    showElement("game_decide");
    setTimeout(function() {
      setScreen("end_screen");
    }, 3000);
    return true;
  }
  else if((players["player"].health <= 0)) {
    setProperty("game_decide","text","Game Over");
    setProperty("game_decide","text-color","red");
    showElement("game_decide");
    setTimeout(function() {
      setScreen("end_screen");
      setProperty("turns_taken","text",turns);
    }, 3000);
    return true;
  }
  return false;
}

function displayDamage(quantity) {
  if(quantity == 0) {
    return;
  }
  var entity;
  var x;
  var y;
  var opacity = 1;
  if(isPlayerTurn) {
    entity = "boss";
    x = 140;
    y = 70;
  } else {
    entity = "player";
    x = 5;
    y = 185;
  }
  var stopVal = y - 30;
  setPosition(entity + "_damage_display",x,y,57,20);
  setProperty(entity + "_damage_display","text", "+"+quantity);
  var displayDamageToggle = timedLoop(100, function() {
    if(y < stopVal) {
      setProperty(entity + "_damage_display", "text", "");
      stopTimedLoop(displayDamageToggle);
    }
    setProperty(entity + "_damage_display","text-color", rgb(255,0,0,opacity));
    setPosition(entity + "_damage_display",x,y,57,20);
    y -= 5;
    opacity -= 0.15;
  });
  jiggle();
}

function jiggle() {
  var entity;
  var startRight;
  var startLeft;
  var yPos;
  if(isPlayerTurn) {
    entity = "boss";
    startRight = 167;
    startLeft = 163;
    yPos = 50;
  } else {
    entity = "player";
    startRight = 52;
    startLeft = 48;
    yPos = 170;
  }
  var right = 0;
  var left = 0;
  var isRight = true;
  var jiggleToggle = timedLoop(80, function() {
    if(isRight) {
      setPosition(entity,startRight-right,yPos,75,75);
      isRight = false;
      right++;
    } else {
      setPosition(entity,startLeft+left,yPos,75,75); 
      isRight = true;
      left++;
    }
    if(getXPosition(entity) == (startRight-2)) {
      setPosition(entity,(startRight-right),yPos,75,75);
      stopTimedLoop(jiggleToggle);
    }
  });
}

function float() {
  function setATimeout(args,time) {
    setTimeout(function() {
      setPosition(args[0],args[1],args[2],args[3]);
    }, time);
  }
  for(var i=0; i<5; i++) {
    setATimeout(["boss",165, 50+i,75,75],100+(i*100));
    setATimeout(["boss", 165, 55-i,75,75],500+(i*100));
    setATimeout(["player", 50, 170+i, 75,75], 100+(i*100));
    setATimeout(["player", 50, 175-i, 75,75], 500+(i*100));
  }
  timedLoop(1000, function() {
    for(var i=0; i<5; i++) {
        setATimeout(["boss",165, 50+i,75,75],100+(i*100));
        setATimeout(["boss", 165, 55-i,75,75],500+(i*100));
        setATimeout(["player", 50, 170+i, 75,75], 100+(i*100));
        setATimeout(["player", 50, 175-i, 75,75], 500+(i*100));
    }
  });
  // timedLoop(1100, function() {
  //   setPosition("player", 50, 185, 75, 75);
  //   setTimeout(function() {
  //     setPosition("player", 50, 180, 75, 75);
  //   }, 500);
  // });
}

function showStatus() {
  var entity;
  var statuses = "";
  if(isPlayerTurn) {
    entity = "boss";
  } else {
    entity = "player";
  }
  for(var i=0; i<players[entity].status.length; i++) {
    statuses += players[entity].status[i].color;
  }
  setProperty(entity + "_status","text",statuses);
}

function useStatus() {
  var entity;
  if(isPlayerTurn) {
    entity = "boss";
  } else {
    entity = "player";
  }
  var totalDamage = 0;
  for(var i=0; i<players[entity].status.length; i++) {
    if((players[entity].status[i].turn - 1) < 0) {
      players[entity].status.splice(i, 1);
    } else {
      totalDamage += window[players[entity].status[i].name](entity);
      players[entity].status[i].turn -= 1;
    }
  }
  displayDamage(totalDamage);
  showStatus();
  return totalDamage;
}

function poison() {
  if(isPlayerTurn) {
    setBossHealth(players["boss"].health - 3);
  } else {
    setPlayerHealth(players["player"].health - 3);
  }
  return 3;
}
function fire() {
  if(isPlayerTurn) {
    setBossHealth(players["boss"].health - 2);
  } else {
    setPlayerHealth(players["player"].health - 2);
  }
  return 2;
}

/*
function timedDescription(description) {
  setProperty("action","text",description);
  setTimeout(function() {
    setProperty("action","text","");
  },1500);
}
*/
//------------------------------------------------------------------------------
//player turn methods


function startTurn() {
  isPlayerTurn = true;
  if(checkLifePoints()) {
    return
  }
  setEnergy(3);
  players["player"].LastCard = "";
  players["player"].cardsPlayed = 0;
  showElement("end_turn_button");
  checkSize(hand.length);
  setPlayerShield(0);
  //fills hand
  for(var i = 0; i<hand.length; i++) {
    var temp = deck.pop();
    hand[i] = temp;
  }
  //renders hand on screen with cool animation
  var index = 0;
  var fillHand = timedLoop(250, function() {
    if(index == (hand.length-1)){
      stopTimedLoop(fillHand);
    }
    setProperty("card"+index,"image", hand[index].image);
    index++;
  });
  setDeck();
}

function checkSize(amount) {
  if(deck.length < amount) {
    var temp = merge(shuffle(discard), deck);
    deck = temp;
    discard = [];
    setProperty("action","text","shuffling deck");
    setTimeout(function() {
      setProperty("action","text","");
    },2000);
    setDiscard();
  }
}

//renders hand for interface
function updateHand() {
  for(var i = 0; i<hand.length; i++) {
    setProperty("card"+i,"image", hand[i].image);
  }
}

//end turn event
onEvent("end_turn_button", "click", function() {
  endTurn();
});

function endTurn(){
  hideElement("end_turn_button");
  for(var i=0;i<hand.length;i++) {
    if(hand[i].name != "none"){
      discard.push(hand[i]);
    }
    hand[i] = cards.blankCard;
  }
  updateHand();
  var damage = useStatus();
 // timedDescription("your statuses did "+damage+"!");
  turns++;
  bossTurn();
}

//player cards
function smite() {
  setEnergy(players["player"].energy - 1);
  setBossHealth(players["boss"].health - 5);
  displayDamage(5);
  return 5;
}

function block() {
  setEnergy(players["player"].energy - 1);
  setPlayerShield(players["player"].shield + 8);
}

function draw() {
  setEnergy(players["player"].energy - 1);
  checkSize(2);
  var count = 0;
  if(deck.length > 0){
    for(var i=0; i < hand.length; i++) {
      if(hand[i].name == "none") {
        hand[i] = deck.pop();
        count++;
      }
      if(count == 2){
        break;
      }
    }
  }
}

function heal() {
  setEnergy(players["player"].energy - 1);
  if((players["player"].health + 5) < 50) {
    setPlayerHealth(players["player"].health + 5);
  } else {
    setPlayerHealth(50);
  }
}

function flame() {
  setEnergy(players["player"].energy - 1);
  players["boss"].status.push(JSON.parse(JSON.stringify(statusEffects.fire)));
  showStatus();
}

function dash() {
  if(players["player"].lastCard != "skill") {
    setEnergy(players["player"].energy - 2);
  }
  setBossHealth(players["boss"].health - 5);
  checkSize(1);
  for(var i=0; i<hand.length; i++){
    if(hand[i].name == "none") {
      hand[i] = deck.pop();
      break;
    }
  }
  displayDamage(5);
  return 5;
}

function smear() {
  setEnergy(players["player"].energy - 2);
  setBossHealth(players["boss"].health - 8);
  players["boss"].status.push(JSON.parse(JSON.stringify(statusEffects.poison)));
  showStatus();
  displayDamage(8);
  return 8;
}

function chain() {
  setEnergy(players["player"].energy - 2);
  for(var i=0; i < hand.length; i++) {
    checkSize(1);
    if(hand[i].name == "none") {
      hand[i] = deck.pop();
    }
  }
}

function fortune() {
  setEnergy(players["player"].energy - 2);
  var randomNum = randomNumber(1,4);
  if(randomNum == 1) {
    setBossHealth(players["boss"].health - 15);
    displayDamage(15);
    return 15;
  }
  if(randomNum == 2) {
    setBossHealth(players["boss"].health - 5);
    displayDamage(5);
    return 5;
  }
  else {
    setBossHealth(players["boss"].health - 10);
    displayDamage(10);
    return 10;
  }
}

function grow() {
  setEnergy(players["player"].energy - 2);
  if((players["player"].health + (3*players["player"].cardsPlayed)) < 50) {
    setPlayerHealth(players["player"].health + (3*players["player"].cardsPlayed));
  } else {
    setPlayerHealth(50);
  }
}
function spirit() {
  setEnergy(players["player"].energy+1);
}

function cleanse() {
  players["player"].status = [];
  setProperty("player_status","text", "");
}

function club() {
  for(var i=0; i<hand.length; i++) {
    if(hand[i].name != "none") {
      return;
    }
  }
  setBossHealth(players["boss"].health - 10);
  displayDamage(10);
  return 10;
}

function fortify() {
  if(players["player"].shield >= 5) {
    setPlayerShield(players["player"].shield + 5);
  }
}

//---------------------------------------------------------------------------------

function bossTurn() {
  isPlayerTurn = false;
  if(checkLifePoints()) {
    return;
  }
  setBossShield(0);
  //pick and execute an attack
  var bossEvent = bossAttacks[randomNumber(0,bossAttacks.length-1)];
  setTimeout(function() {
    setProperty("boss_description","text","Time Keeper is using " + bossEvent.name);
  }, 1000);
  setTimeout(function() {
    window[bossEvent.name]();
  },3000);
  setTimeout(function() {
    setProperty("boss_description","text", "");
  }, 4000);
  setTimeout(function() {
    useStatus();
    startTurn();
  }, 5000);
  setTimeout(function() {
    
  }, 5000);
}

//Boss cards
function strike() {
  setPlayerHealth(players["player"].health - 15);
  displayDamage(15);
}
function slash() {
  players["player"].status.push(JSON.parse(JSON.stringify(statusEffects.fire)));
  setPlayerHealth(players["player"].health-10);
  showStatus();
  displayDamage(10);
}

function reinforce() {
  setBossShield(players["boss"].shield + 10);
  setPlayerHealth(players["player"].health - 10);
  displayDamage(10);
}

//-----------------------------------------------------------------------------



//Deck creation

//data split for each "screen"
var showCase = [
  [cards.spirit,cards.club,cards.fortify,cards.cleanse,cards.blankCard], 
  [cards.smite, cards.block, cards.draw,cards.heal,cards.flame], 
  [cards.smear,cards.dash,cards.chain,cards.fortune,cards.grow]
];

//starting idx
var showCaseIdx = 1;


function switchShowCase(button) {
  if (button == "right") {
    if ((showCaseIdx + 1) > 2) {
      showCaseIdx = 0;
    }
    else {
      showCaseIdx++;
    }
  }
  if (button == "left") {
    if((showCaseIdx - 1) < 0) {
      showCaseIdx = 2;
    }
    else {
      showCaseIdx--;
    }
  }
  for(var i=0; i<5; i++) {
    setProperty("sample_"+i,"image", showCase[showCaseIdx][i].image);
  }
}

function checkCount() {
  if (deck.length == 15) {
    shuffle(deck);
    setScreen("fight_screen");
    startTurn();
    float();
  }
}


//button events
onEvent("right_button","click",function() {
  switchShowCase("right");
});
onEvent("left_button","click",function() {
  switchShowCase("left");
});

function addCardToDeck(cardIdx) {
  if(showCase[showCaseIdx][cardIdx].name != "none") {
    deck.push(showCase[showCaseIdx][cardIdx]);
    checkCount();
    setProperty("deck_count", "text", "Count:    "+deck.length + "/15");  
  }
}
//events for each sample card
onEvent("undo_button","click",function() {
  deck.pop();
  setProperty("deck_count", "text", "count:    "+deck.length + "/15");
});
onEvent("sample_0","click",function() {
  addCardToDeck(0)
});
onEvent("sample_1","click",function() {
  addCardToDeck(1)
});
onEvent("sample_2","click",function() {
  addCardToDeck(2)
});
onEvent("sample_3", "click", function() {
  addCardToDeck(3)
});
onEvent("sample_4", "click", function() {
  addCardToDeck(4)
});

//events for hover description in deckCreateScreen
onEvent("sample_0","mouseover", function() {
  setProperty("card_title","text",showCase[showCaseIdx][0].name);
});
onEvent("sample_0","mouseout", function() {
  setProperty("card_title","text","");
});
onEvent("sample_1","mouseover", function() {
  setProperty("card_title","text",showCase[showCaseIdx][1].name);
});
onEvent("sample_1","mouseout", function() {
  setProperty("card_title","text","");
});
onEvent("sample_2","mouseover", function() {
  setProperty("card_title","text",showCase[showCaseIdx][2].name);
});
onEvent("sample_2","mouseout", function() {
  setProperty("card_title","text","");
});
onEvent("sample_3","mouseover", function() {
  setProperty("card_title","text",showCase[showCaseIdx][3].name);
});
onEvent("sample_3","mouseout", function() {
  setProperty("card_title","text","");
});
onEvent("sample_4","mouseover", function() {
  setProperty("card_title","text",showCase[showCaseIdx][4].name);
});
onEvent("sample_4","mouseout", function() {
  setProperty("card_title","text","");
});

onEvent("card0", "click", function() {
  useCard(0, hand[0]);
});
onEvent("card1", "click", function() {
  useCard(1, hand[1]);
});
onEvent("card2", "click", function() {
  useCard(2, hand[2]);
});
onEvent("card3", "click", function() {
  useCard(3, hand[3]);
}); 

//events for hover in fightScreen
onEvent("deck","mouseover",function() {
  setProperty("action","text","draw");
});
onEvent("deck","mouseout", function() {
  setProperty("action","text","");
});
onEvent("discard","mouseover",function() {
  setProperty("action","text","discard");
});
onEvent("discard","mouseout", function() {
  setProperty("action","text","");
});
onEvent("player_energy", "mouseover", function() {
  setProperty("action","text","Energy");
});
onEvent("player_energy","mouseout", function() {
  setProperty("action","text","");
});
onEvent("player_status","mouseover", function() {
  setProperty("action", "text", "player statuses");
});
onEvent("player_status","mouseout", function() {
  setProperty("action", "text", "");
});
onEvent("boss_status","mouseover", function() {
  setProperty("action", "text", "boss statuses");
});
onEvent("boss_status","mouseout", function() {
  setProperty("action", "text", "");
});
onEvent("card0","mouseover", function() {
  if(hand[0]){
    setProperty("action","text", hand[0].description);
  }
});
onEvent("card0","mouseout", function() {
  if(hand[0]){
    setProperty("action","text","");
  }
});
onEvent("card1","mouseover", function() {
  if(hand[1]){
    setProperty("action","text",hand[1].description);
  }
});
onEvent("card1","mouseout", function() {
  if (hand[1]){
    setProperty("action","text","");
  }
});
onEvent("card2","mouseover", function() {
  if (hand[2]){
    setProperty("action","text",hand[2].description);
  }
});
onEvent("card2","mouseout", function() {
  if(hand[2]){
    setProperty("action","text","");
  }
});
onEvent("card3","mouseover", function() {
  if (hand[3]){
    setProperty("action","text",hand[3].description);
  }
});
onEvent("card3","mouseout", function() {
  if(hand[3]){
    setProperty("action","text","");
  }
});
