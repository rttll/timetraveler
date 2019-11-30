'use strict';

modulejs.define('map', ['ui', 'cronos'], function(ui, cronos) {

  const _self = {}

  let maps = {
    origin: null,
    target: null
  }

  _self.init = async function(originCity) {
    maps.origin = L.map('origin-map', {
      center: [40.713955826286046, -73.60839843750001],
      zoom: 6,
      zoomControl: false
    })
    maps.target = L.map('target-map', {
      center: [48.864714761802794, 2.3730468750000004],
      zoom: 6,
      zoomControl: false
    })

    for (let k in maps) {

      L.tileLayer.provider('Esri.WorldTopoMap').addTo(maps[k]);
      L.control.zoom({position: 'bottomright'}).addTo(maps[k]);

      maps[k].on('click', function(e) {
        let newDates = cronos.zoneChanged(k, e.latlng);
        ui.updateAll(newDates)
      })
    }

    let lls = await getCityCoords(originCity);
    panMap('origin', lls);
  }

  async function getCityCoords(city) {

    let url = `https://us-central1-thisadrian.cloudfunctions.net/timetraveler-geonames?city=${city}`;
    if (window.location.hostname === 'localhost') {
      url = `http://localhost:8080?city=${city}`
    }

    try {
      return await fetch(url, {
        method: 'GET',
      }).then(async function(resp) {
        if (resp.ok) {
          let json = await resp.json();
          if (json.error === undefined) {
            return [json.geonames[0].lat, json.geonames[0].lng];
          } else {
            console.error(resp.error);
          }
        } else {
          console.error(resp);
        }
      })
    } catch(err) {
      console.error(err);
    }
  }

  function panMap(map, ll) {
    maps[map].panTo(ll, {animate: false})
  }

  return _self;

});
