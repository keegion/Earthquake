
const $ = require('jquery');
const Store = require('electron-store');
const store = new Store();
const { ipcRenderer } = require('electron')
let first = true;
// how often the data is updated in milliseconds
let updateFrequency = 300000;
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
var interval;

//Fetch data and return json
async function getData(url) {
    const response = await fetch(url);
    $(loadMsg).append('Loading...<img src="loading.gif">');
    return response.json()
}
//call for fetch and print data
async function main() {

    const data = await getData(url);
    
    console.log("printing data")
    //print table behinning
    const tableBeginning = "<table class='table table-striped table-hover' id='EQList'><tr><td scope='col'>Magnitude</td><td scope='col'>Location</td><td scope='col'>Time </td></tr>"
    $(tableInsert).append(tableBeginning);
    //print all data inside the table
    data.features.forEach(function (item) {
        const coords = item.geometry.coordinates;
        const id = item.id;
        const magnitude = "<td>" + item.properties.mag + "</td>";
        const DateOptions = { hour: 'numeric', minute: 'numeric', seconds: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' }
        const timeFormatted = new Date(item.properties.time).toLocaleDateString("en-GB", DateOptions);
        const time = "<td>" + timeFormatted + "</td>";
        const location = "<td>" + item.properties.place + "</td>";
        let start = "<tr onclick='test(\"" + coords + "\")'>";
        const end = "</tr>";
        //check if this message is new, if it is throw a popup with earthquake data
        checkIfIdExists(id, item.properties.mag, item.properties.place, timeFormatted);
        //Change the color of line to orange if the magnitude is over 7 and red if it's over 8
        if (item.properties.mag > 7) {
            start = "<tr style=color:orange>";
        } else if (item.properties.mag > 8) {
            start = "<tr style=color:red>";
        }
        //all the values put into one message below
        const msg = start + magnitude + location + time + end;
        //apend msg to table
        $(EQList).append(msg);
    
    });
    //print table ending
    const tableEnd = "</table>";
    $(EQList).append(tableEnd);
    first = false;
    $(loadMsg).empty();
    //print last updated at the end of the table
    $(lastUpdate).html("Last update: " + new Date());
}

function checkIfIdExists(id, mag, loc, time) {
    if (!store.has(id) && first === false) {
        msg = "Magnitude " + mag + " earthquake @ " + loc + "  " + time;
        //tray popup
        ipcRenderer.send('openNotification', msg);
        store.set(id, id);

    } else {

        store.set(id, id);

    }


}



loadDatafromStorage();
main()


function clearData() {
    $(tableInsert).empty();
    main();
    
    
}

function test(msg) {
    ipcRenderer.send('openMap', msg);
}



ipcRenderer.on('update', function (e, ) {
    first = true;
    loadDatafromStorage()
    clearData();

});

//load settings data
function loadDatafromStorage() {
    //set updatefrequency from local storage
    console.log("loading data from storage current freq = " + updateFrequency + " and url = " + url)
    if (updateFrequency != store.get("frequency")) {
        updateFrequency = parseInt(store.get("frequency"));
        clearInterval(interval);
        
    }
    //set fetch url from local storage
    if (store.has("url")) {
        url = store.get("url")
    }
    interval = setInterval(function () { clearData() }, updateFrequency);
    console.log("loaded data, new values = " + updateFrequency + " and url = " + url)

}
