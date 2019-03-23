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
    $("#weather-detail-display").hide();
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
    $("#weather-detail-display").show();

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

        getForecast();
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

    // Add a GeoJSON line
    map.on('load', function () {
        map.addLayer({
            "id": "route",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [

                            [-110.821914, 32.309354],
                            [-110.821644, 32.309202],
                            [-110.821536, 32.309202],
                            [-110.821384, 32.309278],
                            [-110.820126, 32.309286],
                            [-110.818859, 32.309293],
                            [-110.81735, 32.309324],
                            [-110.816703, 32.30946],
                            [-110.816479, 32.30946],
                            [-110.815949, 32.309567],
                            [-110.815356, 32.309627],
                            [-110.814808, 32.309582],
                            [-110.814206, 32.309263],
                            [-110.813775, 32.309164],
                            [-110.813218, 32.30924],
                            [-110.812966, 32.309346],
                            [-110.81188, 32.310189],
                            [-110.811583, 32.310675],
                            [-110.811439, 32.310637],
                            [-110.811224, 32.31066],
                            [-110.810604, 32.311313],
                            [-110.810343, 32.31151],
                            [-110.810191, 32.311503],
                            [-110.809813, 32.311267],
                            [-110.809831, 32.311146],
                            [-110.809715, 32.311055],
                            [-110.809795, 32.310842],
                            [-110.809661, 32.310584],
                            [-110.809337, 32.31044],
                            [-110.80869, 32.310257],
                            [-110.808448, 32.310007],
                            [-110.808089, 32.309954],
                            [-110.807738, 32.309817],
                            [-110.807523, 32.309939],
                            [-110.807253, 32.30981],
                            [-110.807352, 32.309392],
                            [-110.807172, 32.309551],
                            [-110.80693, 32.309589],
                            [-110.806552, 32.309278],
                            [-110.806436, 32.309453],
                            [-110.806319, 32.309422],
                            [-110.806121, 32.309453],
                            [-110.805843, 32.309286],
                            [-110.805555, 32.309422],
                            [-110.805124, 32.309422],
                            [-110.804962, 32.309544],
                            [-110.804792, 32.309551],
                            [-110.80463, 32.309658],
                            [-110.804522, 32.30984],
                            [-110.804352, 32.309954],
                            [-110.804226, 32.310151],
                            [-110.803759, 32.310387],
                            [-110.803552, 32.310409],
                            [-110.803337, 32.310364],
                            [-110.803229, 32.31028],
                            [-110.803067, 32.310227],
                            [-110.802429, 32.310204],
                            [-110.802169, 32.310478],
                            [-110.8018, 32.310576],
                            [-110.80136, 32.310766],
                            [-110.801288, 32.310865],
                            [-110.80119, 32.310918],
                            [-110.801288, 32.311586],
                            [-110.801513, 32.311784],
                            [-110.801576, 32.312011],
                            [-110.801729, 32.312262],
                            [-110.801729, 32.312368],
                            [-110.801477, 32.312383],
                            [-110.801324, 32.312497],
                            [-110.801216, 32.312505],
                            [-110.800956, 32.312444],
                            [-110.800848, 32.312474],
                            [-110.800148, 32.312391],
                            [-110.799842, 32.312725],
                            [-110.799734, 32.312664],
                            [-110.799267, 32.312687],
                            [-110.799132, 32.312725],
                            [-110.7988, 32.312725],
                            [-110.79854, 32.312808],
                            [-110.798324, 32.312793],
                            [-110.797875, 32.312922],
                            [-110.797057, 32.313522],
                            [-110.79606, 32.314061],
                            [-110.794874, 32.314334],
                            [-110.793868, 32.314631],
                            [-110.792853, 32.314919],
                            [-110.792602, 32.314942],
                            [-110.792206, 32.315132],
                            [-110.792018, 32.315154],
                            [-110.791955, 32.3152],
                            [-110.791605, 32.315154],
                            [-110.791389, 32.315185],
                            [-110.791793, 32.315291],
                            [-110.791191, 32.315306],
                            [-110.791119, 32.315572],
                            [-110.790823, 32.315542],
                            [-110.789916, 32.315845],
                            [-110.78899, 32.316384],
                            [-110.788056, 32.316916],
                            [-110.787248, 32.317197],
                            [-110.786754, 32.31709],
                            [-110.78617, 32.317675],
                            [-110.785397, 32.318328],
                            [-110.785002, 32.318381],
                            [-110.784382, 32.318662],
                            [-110.783834, 32.318821],
                            [-110.78308, 32.319512],
                            [-110.782226, 32.320028],
                            [-110.7821, 32.320241],
                            [-110.7814, 32.320537],
                            [-110.780546, 32.32084],
                            [-110.779756, 32.321683],
                            [-110.779208, 32.321903],
                            [-110.778911, 32.322192],
                            [-110.777977, 32.322913],
                            [-110.777285, 32.323604],
                            [-110.776225, 32.324082],
                            [-110.776162, 32.323847],
                            [-110.776423, 32.323034],
                            [-110.77548, 32.323968],
                            [-110.775237, 32.324082],
                            [-110.774851, 32.324522],
                            [-110.774231, 32.324537],
                            [-110.773539, 32.325463],
                            [-110.772947, 32.325722],
                            [-110.772614, 32.325608],
                            [-110.77194, 32.325547],
                            [-110.771599, 32.325866],
                            [-110.771303, 32.326018],
                            [-110.770943, 32.326397],
                            [-110.770782, 32.326777],
                            [-110.770485, 32.326891],
                            [-110.770045, 32.326966],
                            [-110.770404, 32.326693],
                            [-110.770566, 32.326321],
                            [-110.770907, 32.32604],
                            [-110.770386, 32.326139],
                            [-110.770234, 32.32639],
                            [-110.770072, 32.326519],
                            [-110.770243, 32.326185],
                            [-110.770494, 32.32598],
                            [-110.770135, 32.326056],
                            [-110.769829, 32.326238],
                            [-110.769578, 32.326261],
                            [-110.769407, 32.32623],
                            [-110.769156, 32.326306],
                            [-110.76894, 32.326306],
                            [-110.768742, 32.326488],
                            [-110.768194, 32.326557],
                            [-110.768392, 32.327111],
                            [-110.768733, 32.327657],
                            [-110.768697, 32.328265],
                            [-110.768302, 32.328743],
                            [-110.768248, 32.329024],
                            [-110.768518, 32.329213],
                            [-110.768814, 32.329145],
                            [-110.769102, 32.32894],
                            [-110.769389, 32.329001],
                            [-110.770081, 32.328743],
                            [-110.771132, 32.328917],
                            [-110.77177, 32.329585],
                            [-110.770782, 32.330344],
                            [-110.769829, 32.330663],
                            [-110.769443, 32.331255],
                            [-110.769192, 32.331528],
                            [-110.768976, 32.331658],
                            [-110.769003, 32.331938],
                            [-110.768913, 32.332204],
                            [-110.768006, 32.332948],
                            [-110.767754, 32.334284],
                            [-110.767673, 32.334413],
                            [-110.767736, 32.334549],
                            [-110.767673, 32.334876],
                            [-110.767485, 32.334678],
                            [-110.767485, 32.335483],
                            [-110.767098, 32.335954],
                            [-110.766703, 32.336242],
                            [-110.766308, 32.337517],
                            [-110.766003, 32.337305],
                            [-110.765931, 32.33776],
                            [-110.765697, 32.338489],
                            [-110.76541, 32.338587],
                            [-110.765284, 32.339384],
                            [-110.765077, 32.339551],
                            [-110.764853, 32.339961],
                            [-110.764565, 32.340227],
                            [-110.764583, 32.340485],
                            [-110.764359, 32.340948],
                            [-110.763766, 32.341297],
                            [-110.763622, 32.341494],
                            [-110.764224, 32.341517],
                            [-110.764368, 32.341593],
                            [-110.763981, 32.341669],
                            [-110.763954, 32.341919],
                            [-110.763712, 32.342094],
                            [-110.763532, 32.341813],
                            [-110.76311, 32.341335],
                            [-110.76284, 32.341183],
                            [-110.762427, 32.341282],
                            [-110.762266, 32.341487],
                            [-110.762104, 32.341616],
                            [-110.762005, 32.341972],
                            [-110.761547, 32.34264],
                            [-110.761511, 32.342747],
                            [-110.761996, 32.342504]
                        ]
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#888",
                "line-width": 8
            }
        });
    });
}



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
            'app_code': 'OCuZ0QBvJ75E8_v0Nh-QCA',
            'useHTTPS': true
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

function getForecast() {
    var OWMapiKey = "166a433c57516f51dfab1f7edaed8413";
    var OWMqueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + globalLatitude + "&lon=" + globalLongitude + "&units=imperial&appid=" + OWMapiKey;
    console.log("OpenWeatherMap query URL: " + OWMqueryURL);
    $("#weather-detail-display > thead").empty();
    $("#weather-detail-display > tbody").empty();

    // Creating an AJAX call
    $.ajax({
        url: OWMqueryURL, method: "GET"
    }).then(function (response) {
        console.log(response);
        var forecastHead = "";
        var forecastRow = "";

        forecastHead = $("<tr>").append(
            $("<th>").text("Weather Forecast: "),
            $("<th>").text("Conditions"),
            $("<th>").text("Temperature"),
            $("<th>").text("Wind Speed"),
            $("<th>").text("Humidity"),
        );

        // Append the new row to the table
        $("#weather-detail-display > thead").append(forecastHead);

        for (var i = 0; i < 5; i++) {
            var forecastRow = $("<tr>").append(
                $("<td>").text("Day " + [i + 1]),
                $("<td>").text(response.list[i * 8].weather[0].description).append($("<img>").attr("src", "http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png").addClass("weatherIcon")),
                $("<td>").text(Math.floor(response.list[i * 8].main.temp) + " (F)"),
                $("<td>").text(response.list[i * 8].wind.speed + " mph"),
                $("<td>").text(response.list[i * 8].main.humidity + "%")
            );
            // Append the new row to the table
            $("#weather-detail-display > tbody").append(forecastRow);
        };

    });
};


// function to refresh display current time every second
// var windowTimeout = setInterval(function () {
//     $("#current-time").text("Current date and time: " + moment().format("dddd, MMMM Do YYYY, hh:mm:ss A"));
// }, 1000 * 1);

$("#menu").hide();
$("#mapContainer").hide();
$("#map").hide();