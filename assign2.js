window.addEventListener('DOMContentLoaded', (event) => {
  const playsArray = JSON.parse(content).sort( function(a, b) {
    return a.title.localeCompare(b.title); //Sorts array alphabeticially.
  });
  const ul = document.querySelector("#listOfPlays");
  appendLiArray(document.querySelector("#listOfPlays"), playsArray); //Append play to list of plays.
  const playList = document.querySelector("#playList");
  /*
  Adds a functino to the radio buttons to sort the array of plays by date/ or by name, then
  add it to the ul element for list of plays.
  */
  playList.addEventListener("click", function(event) { 
    if (event.target.getAttribute("sort") == "name"){
      const nameSort = playsArray.sort( function(a, b) {
        return a.title.localeCompare(b.title);
      });
      appendLiArray(ul, nameSort);
    }
    else if(event.target.getAttribute("sort") == "date"){
      const dateSort = playsArray.sort( (a, b) => a.year < b.year? -1: 1);
      appendLiArray(ul, dateSort);
    }
  });
  /*
  Event listener to populate play section with synopsis and play information upon clicking a play.

  */
  ul.addEventListener("click", function(event) {
    if(event.target.tagName == "LI"){
      var header = document.createElement("h1");
      const play = playsArray.find( p => p.title === event.target.getAttribute("data-id"));
      var body = playBody(play);
      const playDetails = document.querySelector("#playHere");
      //Populates play section with required information.
      header.textContent = `${play.title}`
      playDetails.innerHTML = "";
      playDetails.appendChild(header);
      playDetails.appendChild(body);
      //Populate the synopsis interface/
      synopsisInterface(play);
      //Add event listener to close button that returns to synopsis menu.
      document.querySelector("#btnClose").addEventListener("click", function(event){
        synopsisInterface(play);
        playDetails.innerHTML = "";
        playDetails.appendChild(header);
        playDetails.appendChild(body);
      });
    }
  });
  //Add event listener to display a credits box in the header upon mouseover,
  //deleting it after 5 seconds.
  document.querySelector("#creditButton").addEventListener("mouseover", function(event){
    if(!document.querySelector("#box")){
      var creditBox = document.createElement("div");
      creditBox.setAttribute("id", "box");
      creditBox.textContent = "Matthew Pham COMP 3612";
      header = document.querySelector("header");
      header.insertBefore(creditBox, header.childNodes[2]);
      setTimeout(function(){
        creditBox.remove();
     }, 5000);
  }
  });
});



/**
 * 
 * @param {*} ul The selected ul element to add the list of plays too(plays are stored in li elements) 
 * @param {*} playArray The array containing all the play objects.
 */
function appendLiArray(ul, playArray){
  ul.innerHTML = ""; //Clear ul

  for(const element of playArray){
    //Creates li elements for each play then appends to ul.
    var playName = document.createElement("li");
    playName.textContent = element.title;
    playName.setAttribute("data-id", element.title);
    ul.appendChild(playName);
  }
}
/**
 * Function that appends a list of document elements to an item.
 * @param {*} item A document element.
 * @param {*} array A list of document elements.
 * 
 */
function appendArrayChild(item, array){
  for(const element of array){
    item.appendChild(element);
  }
}
/**
 * 
 * @param {*} play A play object.
 * @returns A body element with the basic play information contained in it.
 */
function playBody(play){
  //Create necessary elements, then sets their approriate values.
  var header = document.createElement("h1");
  var body = document.createElement("body");
  var likelyDate = document.createElement("p");
  var genre = document.createElement("p");
  var links = document.createElement("p");
  var wikiLink = document.createElement("a");
  var gutenberg = document.createElement("a");
  var shakespeare = document.createElement("a");
  var description = document.createElement("p");
  const bodyArray = [likelyDate, genre, links, description];
  const linksArray = [wikiLink, gutenberg, shakespeare];
  genre.textContent = `Genre: ${play.genre}`;
  likelyDate.textContent = `Likely Date: ${play.likelyDate}`;
  wikiLink.setAttribute("href", play.wiki);
  gutenberg.setAttribute("href", play.gutenberg);
  shakespeare.setAttribute("href", play.shakespeareOrg);
  description.textContent = play.desc;
  wikiLink.textContent = "Wikipedia link ";
  gutenberg.textContent = "Gutenberg link ";
  shakespeare.textContent = "Shakespeare Org Link";  
  //Append links to link element.
  appendArrayChild(links, linksArray);
  //Appends necessary elements to the body.
  appendArrayChild(body, bodyArray);
  return body;

}
/**
 * Sets up the synposis interface given a play object.
 * @param {*} play A play object.
 * 
 */
function synopsisInterface(play){
  //Create necessary elements.
  var interface = document.querySelector("#interface");
  var header = document.createElement("h2");
  var synopsis = document.createElement("p");
  var viewText = document.createElement("button");
  // Create an event listener to switch to the play text interface.
  viewText.addEventListener("click", function(event) {
      playTextInterface(play);
  });
  // Populate necessary elements.
  viewText.textContent = "View Play Text";
  synopsis.textContent = play.synopsis;
  header.textContent = play.title;
  interface.innerHTML = "";
  interface.appendChild(header);
  interface.appendChild(synopsis);
  if(play.filename !== ""){
    //Only display option to view text if the given play has a related file name.
    interface.appendChild(viewText);
  }
  //Hide display button when synopsis interface is active.
  document.querySelector("#btnClose").style.display = "none";
}
/**
 * Given a play object, populate the play text interface and retrieve the related play text from 
 * the api. If it is in the local storage already, retrieve it from there, if it is not it is stored 
 * for the future.
 * @param {*} play A play object.
 *
 */
async function playTextInterface(play){
  //Create necessary elements
  var interface = document.querySelector("#interface");
  var actList = document.createElement("select");
  var sceneList = document.createElement("select");
  let playJson = localStorage.getItem(play.id);
  var playDetails;
  var filter = document.createElement("fieldset");
  var playerList = document.createElement("select");
  var search = document.createElement("input");
  var filterButton = document.createElement("button");
  actList.setAttribute("id", "actList");
  sceneList.setAttribute("id", "sceneList");
  playerList.setAttribute("id", "playerList");
  //Display close button again, and clear interface.
  document.querySelector("#btnClose").style.display = "";
  interface.innerHTML = "";
  // Retrieve necessary play json from local storage, if it is not there retrieve from api and store
  // in local storage.
  if (!playJson){
    //fetch data
    playDetails = await fetch(`${api}?name=${play.id}`)
    .then(response => response.json())
    .then(data => {
      // save in local storage   
      localStorage.setItem(play.id, JSON.stringify(data));
      return data;
    });
  }
  else{
    playDetails = JSON.parse(playJson);
  }
  //Populate and fill necessary elements for filter inface.
  search.setAttribute("type", "text");
  search.setAttribute("id","txtHighLight");
  search.setAttribute("placeholder","Enter a search term");
  filterButton.setAttribute("id", "btnHighlight");
  filterButton.textContent = "Filter";
  filter.appendChild(playerList);
  filter.appendChild(search);
  filter.appendChild(filterButton);
  interface.appendChild(actList);
  interface.appendChild(sceneList);
  interface.appendChild(filter);
  // Fill in act select menu.
  for(const act of playDetails.acts){
    var option = document.createElement("option");
    option.setAttribute("value", act.name);
    option.textContent = act.name;
    actList.appendChild(option);
  }
  //Upon changing acts, populate it with only the scenes located in the selected act.
  actList.addEventListener("change", function(event){
   populateSceneList(playDetails, event.target.value);
   populatePlayers(playDetails.acts.find(p => p.name === actList.value).scenes.find(a => a.name === sceneList.value).speeches);
  });
//Populate scene list with default value(act 1).
  populateSceneList(playDetails, "ACT I");
  //Populate players with default scene/act.
  populatePlayers(playDetails.acts.find(p => p.name === actList.value).scenes.find(a => a.name === sceneList.value).speeches);
  //Adds event listener that filters the play text and adds it to the playHere element.
  filterButton.addEventListener("click", function(event){
    populatePlay(playerList.value, playDetails, search.value);
  });
}
/**
 * Populate the scene list given an act name and a play object.
 * @param {*} playDetails A provided play object.
 * @param {*} actName //String for act name.
 */
function populateSceneList(playDetails, actName){
  const interface = document.querySelector("#interface");
  const sceneList = document.querySelector("#sceneList");
  sceneList.innerHTML = "";
  const selectedAct = playDetails.acts.find(p=> p.name === actName);
  //For each scene in the act object, add it as an option.
  for(const scene of selectedAct.scenes){
    var option = document.createElement("option");
    option.setAttribute("value", scene.name);
    option.textContent = scene.name;
    sceneList.appendChild(option);
  }
}
/**
 * Populate the player list given an array of speeches array..
 * @param {*} speeches 
 */
function populatePlayers(speeches){
  const players = new Set();
  //Sets can not contain duplicates, so is used to store the list of players.
  var playerList = document.querySelector("#playerList");
  playerList.innerHTML = "";
  for (const element of speeches){
    players.add(element.speaker);
  }
  //Creates default option(All players) then appends the players and the default option
  // To the players select list.
  arrayPlayers = Array.from(players);
  var defaultOption = document.createElement("option");
  defaultOption.setAttribute("value", 0);
  defaultOption.textContent = "All Players";
  playerList.appendChild(defaultOption);
  for(const player of arrayPlayers){
    var option = document.createElement("option");
    option.textContent = player;
    option.setAttribute("value", player);
    playerList.appendChild(option);
  }
}
/**
 * Populates the playHere element given a search term, which players to include, and the play object.
 * @param {*} players  //String for which player to filter for.
 * @param {*} playDetails  // A play object.
 * @param {*} filter //String for which text to highlight.
 */
function populatePlay(players, playDetails, filter){
  //Create play elements and set appropriate textContent and attributes.
  const playName = playDetails.title;
  const actList = document.querySelector("#actList");
  const sceneList = document.querySelector("#sceneList");
  const currentScene = playDetails.acts.find(p => p.name === actList.value).scenes.find(a => a.name === sceneList.value);
  const play = document.querySelector("#playHere");
  var headerTitle = document.createElement("h2");
  var actArticle = document.createElement("article");
  var actHeader = document.createElement("h3");
  var sceneDiv = document.createElement("div");
  var sceneHeader = document.createElement("h4"); 
  var sceneTitle = document.createElement("p");
  var stageDirection = document.createElement("p");
  var filteredSpeeches;
  play.innerHTML = "";
  headerTitle.textContent = playName;
  sceneHeader.textContent = sceneList.value;
  actHeader.textContent = actList.value;
  actArticle.setAttribute("id", "actHere");
  sceneDiv.setAttribute("id", "sceneHere");
  sceneTitle.setAttribute("class", "title");
  stageDirection.setAttribute("class", "direction");
  sceneTitle.textContent = currentScene.title;
  stageDirection.textContent = currentScene.stageDirection;
  //Append elements in necessary order.
  play.appendChild(headerTitle);
  play.appendChild(actHeader);
  sceneDiv.appendChild(sceneHeader);
  sceneDiv.appendChild(sceneTitle);
  actArticle.appendChild(sceneDiv);
  //If players is not the default option, filter the speeches for 
  // only speeches where the speaker matches the player.
  if(players != 0) {
    filteredSpeeches = currentScene.speeches.filter(s => s.speaker === players);
  }
  else{
    filteredSpeeches = currentScene.speeches;
  }
  //For each speech in filtered speeches, creates a matching div element.
  
    for(const speech of filteredSpeeches){

    var currentSpeech = document.createElement("div");
    var currentSpeaker = document.createElement("span");
    var currentLines;
    currentSpeech.setAttribute("class", "speech");
    currentSpeaker.textContent = speech.speaker;
    //Highlight the filtered word/search term.
    currentLines = highlightSpeeches(filter, speech.lines);
    currentSpeech.appendChild(currentSpeaker);
    //For each line, append the the line to the speech element.
    for(const line of currentLines){
      currentSpeech.appendChild(line);
    }
    sceneDiv.appendChild(currentSpeech);
  }
  actArticle.appendChild(sceneDiv);
  play.appendChild(actArticle);
}
/**
 * 
 * @param {*} filter String for search term.
 * @param {*} text The text to search for the term
 * @returns The text with the search term wrapped in <b>.
 */
function highlightSpeeches(filter, text){
  elementArray = [];
  for(const line of text){
    var currentLine = document.createElement("p");
    currentLine.textContent = line;
    let newText = currentLine.textContent;
    if(filter){
      // Highlighting and adding tag original code is from: https://tomekdev.medium.com/highlight-matching-text-in-javascript-ff803c9af7b0
      const regex = new RegExp(filter, 'gi');
      newText = newText.replace(regex, '<b>$&</b>');
    }
    currentLine.innerHTML = newText;
    //NOTE: Text content did not work, <b> would jus tbe added as a string. 
    // Not sure how to do it without using innerHTML.
    //Push the new line to the array.        
    elementArray.push(currentLine);
  }
  return elementArray;
}

const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php';
/*
 To get a specific play, add play's id property (in plays.json) via query string, 
   e.g., url = url + '?name=hamlet';
 
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=hamlet
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=jcaesar
 https://www.randyconnolly.com/funwebdev/3rd/api/shakespeare/play.php?name=macbeth
 
 NOTE: Only a few plays have text available. If the filename property of the play is empty, 
 then there is no play text available.
*/
 

/* note: you may get a CORS error if you test this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/