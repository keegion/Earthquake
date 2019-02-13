
const $ = require('jquery');
const Store = require('electron-store');
const store = new Store();
const { ipcRenderer } = require('electron')
let first = true;

//Fetch data and return json
async function getData(url) {
    const response = await fetch(url);

    return response.json()
}
//call for fetch and print data
async function main() {
    const data = await getData("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson");
    //const data = await getData("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");
    //const data = await getData("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
    //run forEach as many times as there is major earthquakes past 30 days and print the data of each one to table
    data.features.forEach(function (item) {

        const id = item.id; 
        let start = "<tr>";
        const magnitude = "<td>" + item.properties.mag + "</td>";
        const DateOptions = { hour: 'numeric', minute: 'numeric', seconds: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' }
        const timeFormatted = new Date(item.properties.time).toLocaleDateString("en-GB", DateOptions);
        const time = "<td>" + timeFormatted+"</td>";
        const location = "<td>" + item.properties.place + "</td>";
        const end = "</tr>";
        //check if this message is new, if it is throw a popup with earthquake data
        checkIfIdExists(id, item.properties.mag , item.properties.place, timeFormatted);
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

    $(lastUpdate).html("Last update: "+new Date());
}

function checkIfIdExists(id,mag,loc,time) {
    if (!store.has(id) && first === false) {
        msg = "Magnitude "+mag+" earthquake @ "+loc+" UTC "+ time;
        //tray popup
        ipcRenderer.send('openNotification', msg);
        store.set(id,id);

    } else{

        store.set(id,id);

    }

 
}
main()
function clearData(){
    $(EQList).empty();
    main();
    first = false;
}
setInterval(function(){ clearData() }, 300000);
