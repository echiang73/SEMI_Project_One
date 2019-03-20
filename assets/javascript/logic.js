// Initialize Firebase
var config = {
    apiKey: "AIzaSyDe0j4eOQrEq3lWl3W6zshW5eph48vNTuM",
    authDomain: "take-a-hike-bb76f.firebaseapp.com",
    databaseURL: "https://take-a-hike-bb76f.firebaseio.com",
    projectId: "take-a-hike-bb76f",
    storageBucket: "take-a-hike-bb76f.appspot.com",
    messagingSenderId: "501940076031"
};
firebase.initializeApp(config);

// https://api.mapbox.com/styles/v1/mapbox/outdoors-v9.html?title=true&access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA#16/32.309826/-110.8229

var database = firebase.database();
var globalLatitude = "32.2217"; // default lat for Tucson, AZ
var globalLongitude = "-110.9265"; // default lat for Tucson, AZ
var searchLatitude = "";
var searchLongitude = "";
var imagetxt = "";
var trailId = "";

// Clear dynamic fields
function clearFields(){
    $("#name-trail").empty();
    $("#location-trail").empty();
    $("#summary-trail").empty();
    $("#HP-search-display > thead").empty();
    $("#HP-search-display > tbody").empty();
    $("#HP-image-display").empty();
    $("#modal-btn").empty();
    $("#trail-detail-display > thead").empty();
    $("#trail-detail-display > tbody").empty();
    $("#dynamic-image-display").empty();
}

// To get latitute and longitude of current position
var x = document.getElementById("currentLocation-btn");
function getLocation() {
    clearFields();
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
    searchTrails();
    drawMap();
    drawMap2();
}

// MapBox Search Engine
$("#add-place-btn").on("click", function (event) {
    event.preventDefault();
    clearFields();
    var profile = "mapbox.places";
    var search_text = $("#place-search-input").val().trim();
    var queryURL = "https://api.mapbox.com/geocoding/v5/" + profile + "/" + search_text + ".json?access_token=pk.eyJ1IjoiZWNoaWFuZyIsImEiOiJjanQ3bThubjYwdG5xNDRxenpibW9wNWNyIn0.kXtdrsT0cX6ueibMKnRDRQ";
    console.log("MapBox query URL: " + queryURL);

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: queryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var newSearchRowSet = "";

        console.log("name: " + response.features[0].place_name);
        console.log("lat: " + response.features[0].center[1]);
        console.log("lng: " + response.features[0].center[0]);

        // var newSearchRow = $("<tr>").append(
        //     $("<td>").text(response.features[0].place_name),
        //     $("<td>").text(response.features[0].center[1]),
        //     $("<td>").text(response.features[0].center[0])
        // );

        // // Append the new row to the table
        // $("#search-display > tbody").append(newSearchRow);

        // Temp use index=0 coordinates to map on MapBox
        globalLatitude = response.features[0].center[1];
        globalLongitude = response.features[0].center[0];

        console.log(globalLatitude);
        console.log(globalLongitude);

        document.getElementById('place-search-input').value = '';
        searchTrails();
        drawMap();
        drawMap2();
    });
});

//Perform search of trails on HikingProject.com
function searchTrails() {
    var HPapiKey = "200430235-4fcde47c0989de1903e61a50826e882f";
    var HPqueryURL = "https://www.hikingproject.com/data/get-trails?lat=" + globalLatitude + "&lon=" + globalLongitude + "&maxDistance=10&key=" + HPapiKey;
    console.log("Hiking Project query URL: " + HPqueryURL);
    // $("#HP-search-display > thead").empty();
    // $("#HP-search-display > tbody").empty();
    // $("#HP-image-display").empty();
    // $("#modal-btn").empty();
    clearFields();
    // $("#HP-search-display tr").empty();
    // $("#HP-search-display tr").remove();

    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: HPqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var newSearchHead = "";
        var newSearchRow = "";

        $("<tr>").remove();

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

            // -------- Method 1: .wrap method to dynamically generate images and try to link, but doesn't work!
            var a = $("<a>").attr("href", "details.html");
            // imageTag.wrap(a);
            a.append(imageTag);
            imageDiv.append(a);

            // var pName = $("<p>").text(response.trails[i].name);
            // pName.addClass("imageName");
            // pName.append('<a id="link" href="details.html">testing</a>');
            // pName.wrap("<a href='details.html'> testing3</a>");

            // imageDiv.append(pName);


            // var newInput = {
            //     searchLatitude: searchLatitude,
            //     searchLongitude: searchLongitude
            //   };

            //   database.ref().set({
            //     searchLatitude: searchLatitude
            //   });

            // //   database.ref().push(newInput);
            //   console.log("Firebase: " + searchLatitude);


            // var pCoordinates = $("<p>")
            // pCoordinates.addClass("HPCoordinates");
            // pCoordinates.text(response.trails[i].latitude); // strangely not displayed
            // pCoordinates.text(response.trails[i].longitude); // only this is displayed
            // // imageDiv.append(pCoordinates);

            // // Append the new row to the table
            // // $("#mapbox-search-display > tfoot").append(image);
            // $("#HP-image-display").append(a); // instead of imageTag (or imageDiv) and pName separately
            // // $("#HP-image-display").append(pName);

        };
        // // Select the checkbox to see more info.
        // $(document.body).on("click", ".checkbox", function () {
        //     trailId = $(this).attr("data-to-select");
        //     // console.log(trailId);
        //     // $("#HP-search-display > thead").empty();
        //     // $("#HP-search-display > tbody").empty();
        //     // $("#HP-image-display").empty();
        //     selectTrail();
        // });
    });
    
};

// Select the checkbox to see more info.
$(document.body).on("click", ".checkbox", function () {
    trailId = $(this).attr("data-to-select");
    // console.log(trailId);
    // $("#HP-search-display > thead").empty();
    // $("#HP-search-display > tbody").empty();
    // $("#HP-image-display").empty();
    selectTrail();
});




function selectTrail() {
    var HPapiKey = "200430235-4fcde47c0989de1903e61a50826e882f";
    var HPqueryURL = "https://www.hikingproject.com/data/get-trails-by-id?ids=" + trailId + "&key=" + HPapiKey;
    console.log("Hiking Project query URL: " + HPqueryURL);
    $("#HP-search-display > thead").empty();
    $("#HP-search-display > tbody").empty();
    $("#HP-image-display").empty();
    // $("#trail-detail-info").empty();
    // $("#trail-detail-display > thead").empty();
    // $("#trail-detail-display > tbody").empty();
    
    


    // Creating an AJAX call for the specific search button being clicked
    $.ajax({
        url: HPqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var selectTrailHead = "";
        var selectTrailRow = "";

        $("#name-trail").text(response.trails[0].name);
        $("#location-trail").text(response.trails[0].location);
        $("#summary-trail").text(response.trails[0].summary);

        // Link for virtual tour button
        virtualTourBtn = $("<button>")
            .addClass("btn btn-primary")
            .attr("data-toggle", "modal")
            .text("Virtual Tour");
        
        var atwo = $("<a target='_blank'>").attr("href", "https://www.hikingproject.com/earth/" + response.trails[0].id);

        atwo.append(virtualTourBtn);
        // virtualTourBtn.append(atwo);
        $("#modal-btn").append(atwo);

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

        // -------- Method 1: .wrap method to dynamically generate images and try to link, but doesn't work!
        // var a = $("<a>").attr("href", "details.html");
        // imageTag.wrap(a);

        imageDiv.append(imageTag);

        // -------- Method 2: This will dynamically generate "names" with links to details.html but will rewrite the entire page!
        // imagetxt = response.trails[i].name;
        // document.write("<p>" + imagetxt.link("details.html") + "</p>");

        // -------- Method 3:This will dynamically generate images and names where I want them (sort of non-horizonal) but not linked to webpage!
        // var para = document.createElement("p");
        // var node = document.createTextNode(response.trails[i].name);
        // para.appendChild(node);
        // var element = document.getElementById("HP-image-display");
        // element.appendChild(para);

        // -------- Method 4: This will generate image with name at the bottom of image as well as hyperlink text, but can't combine name and hyperlink!
        var pName = $("<p>").text(response.trails[0].name);
        pName.addClass("imageName");
        pName.append('<a id="link" href="details.html">testing</a>');
        pName.wrap("<a href='details.html'> testing3</a>");

        imageDiv.append(pName);


        // var newInput = {
        //     searchLatitude: searchLatitude,
        //     searchLongitude: searchLongitude
        //   };

        //   database.ref().set({
        //     searchLatitude: searchLatitude
        //   });

        // //   database.ref().push(newInput);
        //   console.log("Firebase: " + searchLatitude);


        
        globalLatitude = response.trails[0].latitude;
        globalLongitude = response.trails[0].longitude;
        

        // Append the new row to the table
        // $("#mapbox-search-display > tfoot").append(image);
        $("#dynamic-image-display").append(imageTag); // instead of imageTag (or imageDiv) and pName separately
        // $("#HP-image-display").append(pName);


        drawMap();
        drawMap2();
    });
};






// Script for Map Box
function drawMap() {

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



// To get lat/lng of current position

// var x = document.getElementById("current-location");
// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         x.innerHTML = "Geolocation is not supported by this browser.";
//     }
// }

// function showPosition(position) {
//     x.innerHTML = "Latitude: " + position.coords.latitude +
//         "<br>Longitude: " + position.coords.longitude;
// }

function drawMap2() {

    // Instantiate a map and platform object:
    var platform = new H.service.Platform({
        'app_id': 'lXHRffwX6TdjZ7BrjvWs',
        'app_code': 'OCuZ0QBvJ75E8_v0Nh-QCA'
    });
    // Retrieve the target element for the map:
    var targetElement = document.getElementById('mapContainer');

    // Get default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate the map:

    // Create the parameters for the geocoding request:
    var geocodingParams = {
        searchText: (globalLatitude, globalLongitude)
    };

    // Define a callback function to process the geocoding response:
    // var onResult = function (result) {
    //     var locations = result.Response.View[0].Result,
    //         position,
    //         marker;
    //     console.log(result);
    var searchLat = globalLatitude;
    var searchLng = globalLongitude;

    $("#mapContainer").empty();
    var map = new H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.normal.map,
        {
            zoom: 14,
            center: { lat: globalLatitude, lng: globalLongitude }
        });

    // Add a marker for each location found

    position = {
        // lat: locations[0].Location.DisplayPosition.Latitude,
        // lng: locations[0].Location.DisplayPosition.Longitude
        lat: globalLatitude,
        lng: globalLongitude
    };
    marker = new H.map.Marker(position);
    map.addObject(marker);

    // };

    // Get an instance of the geocoding service:
    var geocoder = platform.getGeocodingService();

    // Call the geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    // geocoder.geocode(geocodingParams, onResult, function (e) {
    //     alert(e);
    // });
};

// function to refresh display current time every second
// var windowTimeout = setInterval(function () {
//     $("#current-time").text("Current date and time: " + moment().format("dddd, MMMM Do YYYY, hh:mm:ss A"));
// }, 1000 * 1);


// ------- Details.html page begins here ---------------------------------------

drawMap();