var obj = [
   {
    emoji: "🍔",
    emojiText: "Burgers",
    id: 0
  },
  {
    emoji: "🌮",
    emojiText: "Tacos",
    id: 1
  },
  {
    emoji: "🥗",
    emojiText: "Vegetarian",
    id: 2
  },
  {
    emoji: "🍷",
    emojiText: "Wine",
    id: 3
  },
  {
    emoji: "☕️",
    emojiText: "Coffee",
    id: 4
  }
];

var DOMStrings = {
  locationSearch:   document.getElementById("locationSearch"),
  emojiContainer:   document.getElementById("emojiContainer"),
  confirmLocation:  document.getElementById("confirmBtn"),
  resultsContainer: document.getElementById("resultsView"),
  gpsLocationBtn:   document.getElementById('locator')
};

const API_KEY = "***";

let loadingState = false;
// Model Needs To Save:
//--- 1. Emoji Choice Object 2. Selected Emoji State to search for results 3. Location of User

var currentLocation, selectedItem;
class Model {
  saveLocation(input) {
    currentLocation = input;
    alert("Saved Location: " + currentLocation);
  }

  async searchMaps() {
    var list;
    await fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${selectedItem}%20restaurants+in+${currentLocation}&key=${API_KEY}`)
      .then(res => res.json())
      .then(data => (list = data.results));
   //  list = test
   console.log(list)
    return list;
  }

  setChoice(id) {
    var newID = id.replace("emoji-", "");
    selectedItem = obj[newID].emojiText;
  }
//   getGPS(position){
//     var lat = position.coords.latitude
//     var long = position.coords.longitude
//     currentLocation = lat + ',' +long
//     alert(`Lat: ${lat} Long: ${long}`)
//   }
}
class View {
  clearResults() { DOMStrings.resultsContainer.innerHTML = ""; }
  getLocation()  { return DOMStrings.locationSearch.value; }

  renderEmojiView(emojiList) {
    emojiList.forEach(item => {
      DOMStrings.emojiContainer.insertAdjacentHTML( "beforeend", `<a title="${item.emojiText}" class='emojiLink' id='emoji-${item.id}' >${item.emoji}</a>`);
    });
  }

  renderResults(list) {
    if (list != "") {
      list.forEach(e => {
        var openS, storeTime
        if (e.opening_hours.open_now === true ){ openS = 'Open Now!'; storeTime='open' }else{ openS = 'Closed '; storeTime='closed'}

        DOMStrings.resultsContainer.insertAdjacentHTML( "beforeend", 
        // `<a href='#'>${e.name} Address --> ${e.formatted_address} ____ Rating --> ${e.rating} <br></a>`
        `<div class="resCard"><p class="resCard__title">${e.name}</p><p>Rating: ${e.rating} </p><img src="https://via.placeholder.com/150" alt="#"><p class="${storeTime}"> ${openS} </p></div>`
        );
      });
    } else {
      alert("No results found. Sorry :(");
    }
  }
}
class Controller {
  constructor(modelCtrl, viewsCtrl) {
    this.modelCtrl = modelCtrl;
    this.viewsCtrl = viewsCtrl;
  }

  init() {
    DOMStrings.locationSearch.addEventListener("keypress", e => { if (e.key === "Enter") { this.lockLocation(); }});
    DOMStrings.confirmLocation.addEventListener("click",  () => this.lockLocation() );
    DOMStrings.emojiContainer.addEventListener("click", e => { if (e.target !== e.currentTarget) { this.updateEmoji(e); }e.stopPropagation();});
// GEOLOCATION TESTING
   //  DOMStrings.gpsLocationBtn.addEventListener('click', () => {
   //    if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(this.modelCtrl.getGPS, this.showError) }
   //    else{ alert("Geolocation is not valid on this browser. Please manually input a location.") }
   //  })
  }
  lockLocation() {
    let searchLocation = this.viewsCtrl.getLocation();
    this.modelCtrl.saveLocation(searchLocation);
  }
  async search() {
    this.viewsCtrl.clearResults();
    var results = await this.modelCtrl.searchMaps();
    this.viewsCtrl.renderResults(results);
  }

  updateEmoji(e) {
    if (currentLocation === undefined || currentLocation === "") {
      alert("Error! Please enter a location");
    } else {
      this.modelCtrl.setChoice(e.target.id);
      this.search();
    }
  }
  showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation. Enter the location manually or allow permissions.");    
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");        
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out."); 
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");                  
        break;
    }
  }
}

const app = new Controller(new Model(), new View());

app.init();
app.viewsCtrl.renderEmojiView(obj);

var typed = new Typed("#typer", { strings: ["Hello!", "To begin we will need your location.^3000", "Once entered, select any of the emojis."], typeSpeed: 30 });

// Places API Return
// Object. ->
// name -> Name of Place
// opening_hours.open_now -> Returns true or false if they are currently open.
// price_level -> Returns 1 - 3 based on Google Maps.
// rating -> Rating of restraunt
