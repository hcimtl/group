<template>
  <div>
    <div class="ui vertical segment clearing left aligned small-padding">
      <span>{{ term('map') }}</span>
    </div>
    <div class="map-container">
      <div class="map" ref="map"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "group-map",
  data: function() {
    return {
      icon: null,
      map: null,
      clusterGroup: null,
      popup: null,
      markers: [],
      maxBounds: [
        [45.708889, -73.361667],
        [45.308889, -73.761667]
      ],
      watcher: null
    };
  },
  methods: {
    term(term) {
      return this.$store.getters.term(term);
    },
    refresh() {
      const minZoom = this.map.getMinZoom(); // to make it work on zoomSnap 0.5
      this.map.setMinZoom(Math.floor(minZoom));
      this.clusterGroup.clearLayers();

      const markers = [];
      const groups = this.$store.getters.groups;

      groups.forEach(group => {
        if (this.markers[group.id]) {
          markers.push(this.markers[group.id]);
        } else {
          const marker = L.marker(
            new L.LatLng(group.coords.lat, group.coords.lng),
            { icon: this.icon }
          );
          marker.data = group;
          marker.bindPopup(this.popup);
          this.markers[group.id] = marker;
          markers.push(marker);
        }
      });

      this.clusterGroup.addLayers(markers);
      this.map.setMinZoom(minZoom);
    },
    initMap() {
      this.map = new L.Map(this.$refs.map, {
        zoomSnap: 0.5
      });

      const tilelayer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	      maxZoom: 19,
	      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      
      this.map.addLayer(tilelayer);

      this.map.fitBounds(this.maxBounds);
      this.map.setMaxBounds(this.maxBounds);

      this.map.setMinZoom(this.map.getZoom());

      this.map.on("moveend", () => {
        const nb = this.map.getBounds();
        this.$store.commit("setBounds", {
          ne: [nb._northEast.lat, nb._northEast.lng],
          sw: [nb._southWest.lat, nb._southWest.lng]
        });
      });
      this.map.on("popupopen", () => {
        this.map.setMaxBounds(null);
      });
      this.map.on("popupclose", () => {
        this.map.setMaxBounds(this.maxBounds);
      });

      const ce = ele => {
        return document.createElementNS("http://www.w3.org/2000/svg", ele);
      };
      const filter = ce("filter");
      filter.setAttribute("id", "blur-filter");
      filter.setAttribute("height", "500");
      filter.setAttribute("width", "500");
      filter.setAttribute("x", "-250");
      filter.setAttribute("y", "-250");
      const feGaussianBlur = ce("feGaussianBlur");
      feGaussianBlur.setAttribute("in", "SourceGraphic");
      feGaussianBlur.setAttribute("stdDeviation", "12");
      const feComponentTransfer = ce("feComponentTransfer");
      const feFuncA = ce("feFuncA");
      feFuncA.setAttribute("type", "table");
      feFuncA.setAttribute(
        "tableValues",
        "0 0.8 0.8 0.8 0.8 0.8 0.8 0.8 0.8 0.8 0.8"
      );
      const feGaussianBlur2 = ce("feGaussianBlur");
      feGaussianBlur2.setAttribute("stdDeviation", "10");
      feComponentTransfer.appendChild(feFuncA);
      filter.appendChild(feGaussianBlur);
      filter.appendChild(feComponentTransfer);
      filter.appendChild(feGaussianBlur2);

      this.map.on("layeradd", layer => {
        if (layer.layer.options.className == "map-cluster-bounds") {
          const svg = layer.layer._renderer._container;
          if (!svg.querySelector("#blur-filter")) svg.appendChild(filter);
          svg
            .querySelector(".map-cluster-bounds")
            .setAttribute("filter", "url(#blur-filter)");
        }
      });
    },
    initIcon() {
      this.icon = L.divIcon({
        className: "map-marker",
        iconAnchor: [30, 60],
        iconSize: [60, 60],
        popupAnchor: [0, -60],
        html: `<svg class="icon" viewBox="0 0 30 30" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow-filter" x="-15" y="-15" width="30" height="30">
                      <feOffset in="SourceAlpha" dx="1" dy="2" />
                      <feGaussianBlur stdDeviation="2" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.7"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <g filter="url(#shadow-filter)">
                    <circle fill="#06284B" fill-opacity="0.6" class="st0" cx="15" cy="12" r="3"/>
                    <path fill="currentColor" d="M15,5c-3.9,0-7,3.1-7,7c0,5.3,7,13,7,13s7-7.8,7-13C22,8.1,18.9,5,15,5z M15,14.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S16.4,14.5,15,14.5z"/>
                  </g>
                </svg>`
      });
    },
    initPopup() {
      const vueObj = this;

      this.popup = L.popup({
        autoClose: false,
        minWidth: 440,
        autoPanPadding: L.point(50, 50)
      }).setContent(function() {
        const id = this._source.data.id;
        const data = vueObj.$store.getters.groupById(id);
        const term = vueObj.$store.getters.term;
        const topics = data.topics
          .sort((a, b) => {
            return a.id == data.mainTopicId ? -1 : 1;
          })
          .map(topic =>
            data.mainTopicId == topic.id
              ? `<strong>${topic.name}</strong>`
              : topic.name
          )
          .join(", ");
        const members = data.members.map(member => member.name).join(", ");
        const institutions = data.institutions
          .map(institution => institution.name)
          .join(", ");
        return `
            <div class="ui segment basic vertical">
              <h4 class="ui header">
              </h4>
              <div class="content">
              <a target="_blank" href="${data.website}">${data.name} <sup><i class="icon external"></i></sup></a>
                <p>${institutions}</p>
                <p class="ui divider"></p>
                <!-- <p class="keywords">${topics}</p> -->
                <div class="sub header">${members}</div>
              </div>
            </div>
          `;
      });
    },
    initCluster() {
      this.clusterGroup = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const children = cluster.getChildCount();
          const className =
            children < 25 ? "small" : children > 100 ? "large" : "regular";
          const size = children < 25 ? 40 : children > 100 ? 50 : 45;
          return L.divIcon({
            className: `map-cluster ${className}`,
            html: `<span>${children}</span>`,
            iconSize: L.point(size, size)
          });
        },
        maxClusterRadius: 75,
        spiderfyDistanceMultiplier: 1.5,
        spiderLegPolylineOptions: {
          opacity: 0
        },
        polygonOptions: {
          className: "map-cluster-bounds"
        }
      });
      this.map.addLayer(this.clusterGroup);
    },
    locate(id) {
      const marker = this.markers[id];

      this.eventHub.$emit("goToMap", {});
      this.map.closePopup();

      this.clusterGroup.zoomToShowLayer(marker, () => {
        marker.openPopup();
      });
    },
    zoomToBounds() {
      const groups = this.$store.getters.groups;
      const gLength = groups.length;

      if (gLength > 0 && gLength != this.$store.state.group.list.length) {
        const lats = groups
          .map(group => group.coords.lat)
          .sort((a, b) => {
            return a == "" ? 0 : a > b ? -1 : a < b ? 1 : 0;
          });
        const lngs = groups
          .map(group => group.coords.lng)
          .sort((a, b) => {
            return a == "" ? 0 : a > b ? -1 : a < b ? 1 : 0;
          });

        this.map.fitBounds(
          [
            [lats[0], lngs[0]],
            [lats[lats.length - 1], lngs[lngs.length - 1]]
          ],
          {
            maxZoom: 12,
            padding: [20, 20]
          }
        );
      } else {
        this.map.fitBounds(this.maxBounds);
      }
    }
  },
  mounted: function() {
    this.initMap();
    this.initIcon();
    this.initPopup();
    this.initCluster();

    this.eventHub.$on("map-locate", id => {
      this.locate(id);
    });

    this.refresh();

    this.watcher = this.$store.watch(
      (state, getters) => {
        return getters.groups;
      },
      value => {
        this.refresh();
        this.zoomToBounds();
      }
    );
  },
  destroyed: function() {
    this.watcher();
    this.eventHub.$off("map-refresh");
    this.eventHub.$off("locate");
  },
  updated: function() {
    this.eventHub.$emit("app-resize");
  }
};
</script>

<style lang="less">
.ui.segment.small-padding {
  padding: 0.25em 0;
}
.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 65.4%;
  z-index: 400;

  .filters {
    height: 0;
    width: 0;
  }

  .map {
    position: absolute;
    width: 100%;
    height: 100%;

    .leaflet-popup-content-wrapper {
      border-radius: 3px;

      .leaflet-popup-content {
        max-width: 70vw;
        padding: 15px 15px;
        margin: 0 !important;
        box-sizing: border-box;

        .segment {
          padding: 0;

          .header,
          .content {
            @media (max-width: 768px) {
              font-size: 0.7em;
            }
          }

          p {
            margin: 0.25em 0;

            &.divider {
              margin: 0.5em 0;
            }
            &.keywords {
              color: #333;
              font-size: 0.937em;
            }
          }
        }
      }
    }

    .map-cluster-bounds {
      fill: hsla(211, 85%, 36%, 1);
      stroke: hsla(211, 85%, 36%, 1);
      fill-opacity: 1;
      stroke-opacity: 1;
      stroke-width: 0;
    }

    .map-cluster {
      color: #fff;
      border-radius: 50%;
      text-align: center;
      box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.4);

      &.large {
        background: hsla(211, 85%, 16%, 1);
        line-height: 50px;
        font-size: 18px;
      }
      &.regular {
        background: hsla(211, 85%, 22%, 1);
        line-height: 45px;
        font-size: 16px;
      }
      &.small {
        background: hsla(211, 85%, 30%, 1);
        line-height: 40px;
        font-size: 14px;
      }
    }

    .map-marker {
      position: relative;

      .icon {
        display: block;
        width: 100%;
        height: 100%;
        color: hsla(211, 85%, 50%, 1);
      }
    }
  }
}
</style>
