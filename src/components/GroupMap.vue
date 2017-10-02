<template>
  <div class="map" ref="map">
    <svg>
      <defs>
        <filter id="shadow-filter" x="0" y="0" width="200%" height="200%">
          <feOffset in="SourceAlpha" dx="1" dy="2" />
          <feGaussianBlur in="offOut" stdDeviation="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.7"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="blur-filter" x="-250px" y="-250px" width="500px" height="500px">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script>
  import './../../node_modules/leaflet/dist/leaflet.js'
  import './../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js'

  export default {
    name: 'group-map',
    data: function() {
      return {
        icon: null,
        map: null,
        markers: null,
        first: true
      }
    },
    methods: {
      refresh(){
        const start = Date.now()
        this.markers.clearLayers()

        const markers = []
        const groups = this.$store.getters.groups
        const l = groups.length
        for(let i = 0; i < l; i++){
          const group = groups[i]
          const marker = L.marker(new L.LatLng(group.coords.lat, group.coords.lng), { icon: this.icon})
          marker.bindPopup(
            `<a target="_blank" href="${group.website.replace(/^#/,'')}">${group.name}</a><br>
            <strong>institution:</strong> ${group.institutionId}<br>
            <strong>head:</strong> ${group.headIds.join(', ')}<br>
            <strong>topics:</strong> ${group.topicIds.join(', ')}<br>`
          )

          this.markers.addLayer(marker)
        }

        this.map.addLayer(this.markers)
        console.log(Date.now() - start)
      }
    },
    mounted: function() {
      this.map = new L.Map(this.$refs.map, {
        crs: L.CRS.EPSG3857,
        zoomSnap: 0.5
      });

      const url = 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg';
      const tilelayer = new L.tileLayer(url);
      tilelayer.getAttribution = function() {
        return '<a href="https://www.swisstopo.admin.ch/de/home.html" target="_blank"> swisstopo</a>';
      };
      this.map.addLayer(tilelayer);

      const corner1 = L.latLng(47.933243004813725, 10.575639903386495)
      const corner2 = L.latLng(45.639066961601685, 5.883893951813307)
      const bounds = L.latLngBounds(corner2, corner1);
      this.map.setMaxBounds(bounds);
      this.map.fitBounds(bounds)
      this.map.setMinZoom(this.map.getZoom())



      this.icon = L.divIcon({
        className: 'map-marker',
        iconAnchor: [22, 44],
        iconSize: [44, 44],
        popupAnchor: [0, -44],
        html: `<svg class="icon" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <circle fill="#ffffff" cx="12" cy="9" r="3"/>
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>`
      })

      this.markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const children = cluster.getChildCount()
          const className = children < 25 ? 'small' : children > 100 ? 'large' : 'regular'
          const size = children < 25 ? 30 : children > 100 ? 50 : 40
          return L.divIcon({
            className: `map-cluster ${className}`,
            html: `<span>${children}</span>`,
            iconSize: L.point(size, size)
          })
        },
        spiderLegPolylineOptions: {
          opacity: 0
        },
        polygonOptions: {
          className: 'map-cluster-bounds'
        }
      })

      this.refresh();
      this.$store.watch((state, getters) => { return getters.groups }, (value) => {
        this.refresh()
      })
    }
  }
</script>

<style lang="less">
  .map {
    position: absolute;
    width: 100%;
    height: 100%;

    .map-cluster-bounds {
      fill: #3388ff;
      stroke: #3388ff;
      fill-opacity: 1;
      stroke-opacity: 1;
      stroke-width: 30px;
      filter: url('#blur-filter');
      opacity: 0.8;
    }

    .map-cluster {
      color: #fff;
      border-radius: 50%;
      text-align: center;
      box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.4);

      &.large {
        background: #004056;
        line-height: 50px;
        font-size: 18px;
      }
      &.regular {
        background: #005875;
        line-height: 40px;
        font-size: 16px;
      }
      &.small {
        background: #006f94;
        line-height: 30px;
        font-size: 14px;
        font-weight: bold;
      }
    }

    .map-marker {
      position: relative;

      .icon {
        display: block;
        width: 100%;
        height: 100%;
        color: #4581ba;
        filter: url('#shadow-filter');
      }
    }
  }
</style>
