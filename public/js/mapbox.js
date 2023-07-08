/* eslint-disable */
const mapBox = document.getElementById('map');

if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmVlZnltdWZmaW5zIiwiYSI6ImNsam5iY2JxNzE3Y2wzc290N3FzcGVva2MifQ.xDTcfKhKiYFRyH_vs4MVcw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/beefymuffins/cljp0x2dz00t401pgamylh7fo',
    scrollZoom: false,
    // center: [-118.113491, 34.111745], // (Lat, Lng)
    // zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', // bottom of pin is on exact location
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  // fitBounds(): executes the moving and zooming of the map
  // Add padding so they all display nicely
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
}
