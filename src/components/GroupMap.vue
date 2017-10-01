<template>
  <div class="map" ref="map"></div>
</template>

<script>
  import './../../node_modules/leaflet/dist/leaflet.js'
  import './../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js'

  export default {
    name: 'group-map',
    data: function() {
      return {}
    },
    mounted: function() {
      const map = new L.Map(this.$refs.map, {
        crs: L.CRS.EPSG3857,
        zoomSnap: 0.5
      });

      const url = 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg';
      const tilelayer = new L.tileLayer(url);
      tilelayer.getAttribution = function() {
        return '<a href="https://www.swisstopo.admin.ch/de/home.html" target="_blank"> swisstopo</a>';
      };
      map.addLayer(tilelayer);

      const corner1 = L.latLng(47.933243004813725, 10.575639903386495)
      const corner2 = L.latLng(45.639066961601685, 5.883893951813307)
      const bounds = L.latLngBounds(corner2, corner1);
      map.setMaxBounds(bounds);
      map.fitBounds(bounds)
      map.setMinZoom(map.getZoom())

      const markers = L.markerClusterGroup()

      this.$store.watch((state, getters) => { return getters.groups }, function(value){
        for(let i in value) {
          const group = value[i]
          const marker = L.marker(new L.LatLng(group.coords.lat, group.coords.lng), group)
          marker.bindPopup(name)
          markers.addLayer(marker)
        }
        map.addLayer(markers)
      })
    }
  }
</script>

<style lang="less">
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
