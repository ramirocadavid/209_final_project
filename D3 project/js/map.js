// Data sources
var map_link = "https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
var attribution_text = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>';
var mm_geodata = "https://raw.githubusercontent.com/r5cm/209_final_project/master/D3%20project/data/test_data.csv"
var burglar_url = 'https://github.com/r5cm/209_final_project/blob/master/D3%20project/images/bandit-icon-529521.png?raw=true'
var gun_url = 'https://github.com/r5cm/209_final_project/blob/master/D3%20project/images/icon_gun.png?raw=true'

// Icon variables
var burglarIcon = L.icon({
            iconUrl: burglar_url,
            iconSize:     [14, 30],
            iconAnchor:   [7, 30],
            popupAnchor:  [-3, -76]
        });
var gunIcon = L.icon({
            iconUrl: gun_url,
            iconSize:     [14, 30],
            iconAnchor:   [7, 30],
            popupAnchor:  [-3, -76]
        });

// Capitalize first letter function
function capitalizeFirstLetter(string) {
  var first = string.charAt(0).toUpperCase();
  var rest = string.slice(1).toLowerCase();
  return first + rest
}

// date-time parser


// Draw markers function
var draw_markers = function(data) {
  markersGroup = L.layerGroup().addTo(map);
  for(var i=0; i < data.length; i++) {
    // Get vars
    var coords = data[i]['LatLng'].replace('(', '').replace(')', '').split(', ');
    var lat = parseFloat(coords[0]);
    var long = parseFloat(coords[1]);
    var date = '<b>Date: </b>' + data[i]['Date']
    
    // Create points
    if (i % 2 == 0) {
      var point = L.marker([lat, long], {icon: burglarIcon});  
    } else {
      var point = L.marker([lat, long], {icon: gunIcon, rotationAngle: 45});  
    }        
    
    //Create popup
    var cat = '<b>Category: </b>' + capitalizeFirstLetter(data[i]['Category'])
    var disp = '<b>Disposition: </b>' + capitalizeFirstLetter(data[i]['Disposition'])
    var pu_content = '<p>'+date+'<br />'+cat+'<br />'+disp+'</p>'
    point.bindPopup(pu_content)
          .addTo(markersGroup);
  }
}

// View without data
function initializePage() {
  map = L.map("divmap").setView([37.8782683,-122.259196], 13);
  L.tileLayer(map_link, {maxZoom: 18, attribution: attribution_text, id: "mapbox.light"})
    .addTo(map);
}
initializePage();

//-------------------------
// Build view
//-------------------------

// Add data
d3.csv(mm_geodata, function(data) {
  
  // Parse data
  var extract_time = function(date) {
    var time = date.match(/ .*/gm);
    return time[0].slice(1);
  }
  data.forEach(function(d) {
    d['DateTime'] = d['Date'];
    d['Date'] = d['Date'].slice(0, 8)
    d['Time'] = extract_time(d['DateTime'])
  })
  console.log("Data:");
  console.log(data);
  
  // Draw markers
  draw_markers(data);

  //--------------
  // Date filter
  //--------------

  // Add input menu
  d3.select('#divfilter')
    .append('input')
      .attr('type', 'text')
      .attr('name', 'datetimes')
      .attr('id', 'datetimes')
  $('#datetimes').daterangepicker({
    "timePicker": true,
    "timePicker24Hour": true,
    "timePickerIncrement": 15,
    "startDate": "07/14/2019",
    "endDate": "07/20/2019"
  }, function(start, end, label) {
    console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');

  });

  //--------------
  // Crime filter
  //--------------

  // Get unique crime categories
  var categories = ['All'];
  for (var i=0; i < data.length; i++) {
    var category = data[i]['Category'];
    if(categories.indexOf(category) < 0) {
        categories.push(category);
    };
  };
  console.log("Categories:");
  console.log(categories);

  // Add crime category menu
  d3.select("#divfilter")
    .append("p")
      .text("Category")
      .attr("align", "left")
    .append("select")
      .attr("id", "crimeSelector")
      .selectAll("option")
      .data(categories)
      .enter()
      .append("option")
        .attr("class", "cat_option")
        .text(d => capitalizeFirstLetter(d))
        .attr("value", d => d)
        .attr("color", "black");

  // Filter data based on crime category
  var filter_cat_val;
  var filter_cat = function() {
    // remove markers
    if (map.hasLayer(markersGroup)) {
      markersGroup.clearLayers();
    };
    // create filtered markers
    filter_cat_val = d3.select(this).property('value');
    console.log("Category selected:");
    console.log(filter_cat_val);
    data_cat = [];
    if (filter_cat_val == "All") {
      draw_markers(data)
    } else {
      for (var i=0; i<data.length; i++) {
        if (data[i]['Category'] == filter_cat_val) data_cat.push(data[i]);
      };
      console.log("Data filtered by category:")
      console.log(data_cat)
      draw_markers(data_cat)
    };
  };

  d3.select('#crimeSelector')
    .on("change", filter_cat);

});