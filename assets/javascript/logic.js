// Initialize Firebase
var config = {
    apiKey: "AIzaSyAT8nHuIDEOMChpRu6QTuTn4ALjJ8QQMNA",
    authDomain: "hiking-project-78923.firebaseapp.com",
    databaseURL: "https://hiking-project-78923.firebaseio.com",
    projectId: "hiking-project-78923",
    storageBucket: "hiking-project-78923.appspot.com",
    messagingSenderId: "135848642912"
};
firebase.initializeApp(config);

// Global Variables ---------------------------------------------------------------------------------------------------

var database = firebase.database();
var globalLatitude = "32.222916"; // default lat for downtown Tucson, AZ
var globalLongitude = "-110.972145"; // default lat for downtown Tucson, AZ
var imagetxt = "";
var trailId = "";
var hereMapPar = "";
var hereMap = "";

// Functions -----------------------------------------------------------------------------------------------------------

// Clear dynamic fields
function clearFields() {
    $("#name-trail").empty();
    $("#location-trail").empty();
    $("#summary-trail").empty();
    $("#HP-search-display > thead").empty();
    $("#HP-search-display > tbody").empty();
    $("#gallery-head").empty();
    $("#HP-image-display").empty();
    $("#modal-btn").empty();
    $("#driving-btn").empty();
    $("#trail-detail-display > thead").empty();
    $("#trail-detail-display > tbody").empty();
    $("#dynamic-image-display").empty();
    $("#mapContainer").empty();
}

// Hide dynamic elements
function hideElements() {
    $("#menu").hide();
    $("#map").hide();
    $("#gallery-head").hide();
    $("#condition-trail").hide();
}

// To get latitute and longitude of current position
var x = document.getElementById("currentLocation-btn");
function getLocation() {
    clearFields();
    hideElements();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    // Store coordinates to global variable
    globalLatitude = position.coords.latitude;
    globalLongitude = position.coords.longitude;
    // Set global variables to firebase storage
    database.ref().set({
        globalLatitude: globalLatitude,
        globalLongitude: globalLongitude
    });
    searchTrails();
    // drawMap();
    drawMap10();
}

// MapBox Search Engine for places, address, point of interest and return coordinates
$("#add-place-btn").on("click", function (event) {
    event.preventDefault();
    clearFields();
    hideElements();
    var profile = "mapbox.places";
    var search_text = $("#place-search-input").val().trim();
    var queryURL = "https://api.mapbox.com/geocoding/v5/" + profile + "/" + search_text + ".json?access_token=pk.eyJ1IjoiZWNoaWFuZyIsImEiOiJjanQ3bThubjYwdG5xNDRxenpibW9wNWNyIn0.kXtdrsT0cX6ueibMKnRDRQ";
    console.log("MapBox query URL: " + queryURL);

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: queryURL, method: "GET"
    }).then(function (response) {
        console.log(response.features[0].place_name);
        var newSearchRowSet = "";

        // Temp use index=0 coordinates to map on MapBox
        globalLatitude = response.features[0].center[1];
        globalLongitude = response.features[0].center[0];

        // Set global variables to firebase storage
        database.ref().set({
            globalLatitude: globalLatitude,
            globalLongitude: globalLongitude
        });

        document.getElementById('place-search-input').value = '';
        searchTrails();
        drawMap10();
    });
});

//Perform search of 10 trails on HikingProject.com
function searchTrails() {
    var HPapiKey = "200430235-4fcde47c0989de1903e61a50826e882f";
    var HPqueryURL = "https://www.hikingproject.com/data/get-trails?lat=" + globalLatitude + "&lon=" + globalLongitude + "&maxDistance=10&key=" + HPapiKey;
    console.log("Hiking Project query URL: " + HPqueryURL);
    clearFields();
    $("#gallery-head").show();

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: HPqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var newSearchHead = "";
        var newSearchRow = "";

        newSearchHead = $("<tr>").append(
            $("<th>").text("Select"),
            $("<th>").text("Trail Name"),
            $("<th>").text("Location"),
            $("<th>").text("Length"),
            $("<th>").text("Ascent"),
            $("<th>").text("Difficulty"),
            $("<th>").text("Rating")
        );

        // Append the new row to the table
        $("#HP-search-display > thead").append(newSearchHead);

        var imageHeader = $("<p>").text("Image Gallery:").add("<hr/>");
            $("#gallery-head").append(imageHeader);

        for (var i = 0; i < response.trails.length; i++) {
            var newSearchRow = $("<tr>").append(
                $("<td>").text("#" + [i + 1] + " " + response.trails[i].name),
                $("<td>").text(response.trails[i].location),
                $("<td>").text(response.trails[i].length + " mi"),
                $("<td>").text(response.trails[i].ascent + " ft"),
                $("<td>").text(response.trails[i].difficulty),
                $("<td>").text(response.trails[i].stars + "/5")
            );

            var toSelect = $("<button>");
            trailId = response.trails[i].id;
            toSelect.attr("data-to-select", trailId);
            toSelect.addClass("checkbox");
            toSelect.text("✓");
            newSearchRow = newSearchRow.prepend(toSelect);

            // Append the new row to the table
            $("#HP-search-display > tbody").append(newSearchRow);

            // Create div with image and name to append to HTML
            var imageDiv = $("<div class='imageDiv'>");

            var imageTag = $("<img>")
            imageTag.attr("src", response.trails[i].imgSqSmall);
            imageTag.width("200px");
            imageTag.addClass("image");
            imageTag.attr("data-to-select", trailId);
            imageDiv.append(imageTag);

            // var a = $("<a>").attr("href", "details.html");
            // a.append(imageTag);
            // imageDiv.append(a);

            var pName = $("<p>").text(response.trails[i].name);
            pName.addClass("imageName");

            imageDiv.append(pName);
            $("#HP-image-display").append(imageDiv);
        };
    });
};

// Select the checkbox to see more information
$(document.body).on("click", ".checkbox", function () {
    trailId = $(this).attr("data-to-select");

    // Set global variables to firebase storage
    database.ref().set({
        trailId: trailId
    });
    selectTrail();
});

// Select the image to see more information
$(document.body).on("click", ".image", function () {
    trailId = $(this).attr("data-to-select");

    // Set global variables to firebase storage
    database.ref().set({
        trailId: trailId
    });
    selectTrail();
});


function selectTrail() {
    var HPapiKey = "200430235-4fcde47c0989de1903e61a50826e882f";
    var HPqueryURL = "https://www.hikingproject.com/data/get-trails-by-id?ids=" + trailId + "&key=" + HPapiKey;
    console.log("Hiking Project query URL: " + HPqueryURL);
    $("#HP-search-display > thead").empty();
    $("#HP-search-display > tbody").empty();
    $("#HP-image-display").empty()
    $("#mapContainer").hide();
    $("#gallery-head").hide();
    $("#condition-trail").show();

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: HPqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var selectTrailHead = "";
        var selectTrailRow = "";
        globalLatitude = response.trails[0].latitude;
        globalLongitude = response.trails[0].longitude;

        $("#name-trail").text(response.trails[0].name);
        $("#location-trail").text(response.trails[0].location);
        $("#summary-trail").text('"' + response.trails[0].summary + '"');
        $("#condition-trail").text('Condition: "' + response.trails[0].conditionDetails + '"');

        // Link for virtual tour button
        virtualTourBtn = $("<button>")
            .addClass("btn btn-info")
            .attr("data-toggle", "modal")
            .text("Virtual Tour");

        var atwo = $("<a target='_blank'>").attr("href", "https://www.hikingproject.com/earth/" + response.trails[0].id);

        atwo.append(virtualTourBtn);
        // virtualTourBtn.append(atwo);
        $("#modal-btn").append(atwo);

        // Link for driving directions button
        drivingBtn = $("<button>")
            .addClass("btn btn-info")
            .attr("data-toggle", "modal")
            .text("Driving Directions");

        var athree = $("<a target='_blank'>").attr("href", "https://www.google.com/maps/dir//" + globalLatitude + "," + globalLongitude);

        athree.append(drivingBtn);
        $("#driving-btn").append(athree);

        selectTrailHead = $("<tr>").append(
            $("<th>").text("Length"),
            $("<th>").text("Ascent"),
            $("<th>").text("Low"),
            $("<th>").text("High"),
            $("<th>").text("Difficulty"),
            $("<th>").text("Rating"),
            $("<th>").text("Status")
        );

        // Append the new row to the table
        $("#trail-detail-display > thead").append(selectTrailHead);

        var selectTrailRow = $("<tr>").append(
            $("<td>").text(response.trails[0].length + " mi"),
            $("<td>").text(response.trails[0].ascent + " ft"),
            $("<td>").text(response.trails[0].low + " ft"),
            $("<td>").text(response.trails[0].high + " ft"),
            $("<td>").text(response.trails[0].difficulty),
            $("<td>").text(response.trails[0].stars + "/5"),
            $("<td>").text(response.trails[0].conditionStatus),
        );

        // Append the new row to the table
        $("#trail-detail-display > tbody").append(selectTrailRow);

        // Create div with image and name to append to HTML
        var imageDiv = $("<div class='imageDiv'>");

        var imageTag = $("<img>")
        imageTag.attr("src", response.trails[0].imgMedium);
        imageTag.width("350px");
        imageTag.addClass("image");
        imageDiv.append(imageTag);

        var pName = $("<p>").text(response.trails[0].name);
        pName.addClass("imageName");
        imageDiv.append(pName);

        globalLatitude = response.trails[0].latitude;
        globalLongitude = response.trails[0].longitude;

        database.ref().set({
            globalLatitude: globalLatitude,
            globalLongitude: globalLongitude
        });

        // Append the new row to the table
        $("#dynamic-image-display").append(imageTag);

        drawMap();
    });
};

// Script for Map Box 2D/3D maps
function drawMap() {
    $("#menu").show();
    $("#map").show();
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWNoaWFuZyIsImEiOiJjanQ3bThubjYwdG5xNDRxenpibW9wNWNyIn0.kXtdrsT0cX6ueibMKnRDRQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        zoom: 13,
        center: [globalLongitude, globalLatitude] // Starting position for global coordinates from MapBox search
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    var layerList = document.getElementById('menu');
    var inputs = layerList.getElementsByTagName('input');

    function switchLayer(layer) {
        var layerId = layer.target.id;
        map.setStyle('mapbox://styles/mapbox/' + layerId + '-v9');
    }

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onclick = switchLayer;
    }

    // To add 3D buildings
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWNoaWFuZyIsImEiOiJjanQ3bThubjYwdG5xNDRxenpibW9wNWNyIn0.kXtdrsT0cX6ueibMKnRDRQ';
    var map = new mapboxgl.Map({
        style: 'mapbox://styles/mapbox/light-v9',
        // center: [-122.486052, 37.830348], //for the GeoJSON Line
        center: [globalLongitude, globalLatitude], // Starting position for global coordinates from MapBox search

        zoom: 15.5,
        pitch: 45,
        // bearing: 17.6,
        bearing: 0.0,
        container: 'map'
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    // The 'building' layer in the mapbox-streets vector source contains building-height
    // data from OpenStreetMap.
    map.on('load', function () {
        // Insert the layer beneath any symbol layer.
        var layers = map.getStyle().layers;

        var labelLayerId;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                labelLayerId = layers[i].id;
                break;
            }
        }

        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "height"]
                ],
                'fill-extrusion-base': [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "min_height"]
                ],
                'fill-extrusion-opacity': .6
            }
        }, labelLayerId);
    });
}

// Add a GeoJSON line



function drawMap10() { // Here.com map with 10 markers
    var HPapiKey = "200430235-4fcde47c0989de1903e61a50826e882f";
    var HPqueryURL = "https://www.hikingproject.com/data/get-trails?lat=" + globalLatitude + "&lon=" + globalLongitude + "&maxDistance=10&key=" + HPapiKey;
    // console.log("Hiking Project query URL: " + HPqueryURL);
    clearFields();
    $("#mapContainer").show();

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: HPqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);

        // Instantiate a map and platform object:
        var platform = new H.service.Platform({
            'app_id': 'lXHRffwX6TdjZ7BrjvWs',
            'app_code': 'OCuZ0QBvJ75E8_v0Nh-QCA'
        });
        // Retrieve the target element for the map:
        var targetElement = document.getElementById('mapContainer');

        // Get default map types from the platform object:
        var defaultLayers = platform.createDefaultLayers();

        // Create the parameters for the geocoding request:
        var geocodingParams = {
            searchText: (globalLatitude, globalLongitude)
        };

        $("#mapContainer").empty();
        var map = new H.Map(
            document.getElementById('mapContainer'),
            defaultLayers.normal.map,
            {
                zoom: 11,
                center: { lat: globalLatitude, lng: globalLongitude }
            });

        // marker for current position based on global Lat/Lng
        position = {
            lat: globalLatitude,
            lng: globalLongitude
        };

        marker = new H.map.Marker(position)
        map.addObject(marker);
        // };

        // Get an instance of the geocoding service:
        var geocoder = platform.getGeocodingService();

        // Add a marker for each location found
        for (var i = 0; i < response.trails.length; i++) {
        position = {
            lat: response.trails[i].latitude,
            lng: response.trails[i].longitude
        };
        marker = new H.map.Marker(position);
        map.addObject(marker);
        // };

        // Get an instance of the geocoding service:
        var geocoder = platform.getGeocodingService();
    }
    // Call the geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    // geocoder.geocode(geocodingParams, drawMap10, function (e) {
    //     alert(e);
    // });
});
};

// function to refresh display current time every second
// var windowTimeout = setInterval(function () {
//     $("#current-time").text("Current date and time: " + moment().format("dddd, MMMM Do YYYY, hh:mm:ss A"));
// }, 1000 * 1);

$("#menu").hide();
$("#mapContainer").hide();
$("#map").hide();