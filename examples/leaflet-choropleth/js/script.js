var mapboxAccessToken = 'pk.eyJ1IjoiZ2lzbHN1IiwiYSI6ImNqMHIwZHlrdzAyMncycW81cTV6cDBldjgifQ.e0o7UhbPkntZ8NdS5VtqSw'
var map = L.map('us-map').setView([37.8, -96], 4)
var geojson
var info

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
  id: 'mapbox.light'
}).addTo(map)

$.getJSON('http://localhost:4000/examples/geojson/us_states_pop_density_2011.geojson', function (geojsonData) {
  createMapContent(geojsonData)
})

function getColor (d) {
  return d > 1000 ? '#800026'
    : d > 500 ? '#BD0026'
    : d > 200 ? '#E31A1C'
    : d > 100 ? '#FC4E2A'
    : d > 50 ? '#FD8D3C'
    : d > 20 ? '#FEB24C'
    : d > 10 ? '#FED976'
    : '#FFEDA0'
}

function style (feature) {
  return {
    fillColor: getColor(feature.properties.density),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  }
}

function highlightFeature (e) {
  var layer = e.target

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  })

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront()
  }

  info.update(layer.feature.properties)
}

function resetHighlight (e) {
  geojson.resetStyle(e.target)
  info.update()
}

function zoomToFeature (e) {
  map.fitBounds(e.target.getBounds())
}

function onEachFeature (feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  })
}

function createMapContent (geojsonData) {
  geojson = L.geoJson(geojsonData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map)
  info = L.control()
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info') // create a div with a class "info"
    this.update()
    return this._div
  }
  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' + (props
      ? '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
      : 'Hover over a state')
  }
  info.addTo(map)
  var legend = L.control({position: 'bottomright'})
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var grades = [0, 10, 20, 50, 100, 200, 500, 1000]
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }
    return div
  }
  legend.addTo(map)
}
