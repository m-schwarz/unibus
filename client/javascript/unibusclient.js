Backbone.$ = $;

$(function () {
    /*
    * Model definitions for the bus app
    */

    var CurrentLocation = Backbone.Model.extend({
        defaults: {
            latitute: -1,
            longitute: -1
        }
    });

    var AreaBusStopData = Backbone.Model.extend({

        defaults: {
            busStopList : []
        },

        initialize: function (options) {
            _.bindAll(this, 'updateBusStopData');
            options.location.bind('change', this.updateBusStopData);
            this.location = options.location;
            this.updateBusStopData();
        },

        updateBusStopData: function () {
            var latitute = this.location.get("latitute");
            var longitute = this.location.get("longitute");
            var outer = this;
            if (latitute != -1 || longitute != -1) {
                $.get("service/stopsInArea", {
                    coordX: Math.round(latitute * 1E6),
                    coordY: Math.round(longitute * 1E6),
                    distance: 1000
                }, function (jsonBusStopList) {
                    outer.set("busStopList", jsonBusStopList);
                }, "json");
            }
        }
    });

    var BusStopDepartureInformation = Backbone.model.extend({


    });

    /*
     * View definitions for the bus app
     */

    var LocationView = Backbone.View.extend({

        initialize: function () {
            // binds 'this' for the methods. There clearly must be a more clever way of doing this?
            _.bindAll(this, 'storePosition', 'getAndWatchLocation', 'render');
            this.getAndWatchLocation(this.storePosition);
            this.render();
            this.model.bind('change', this.render);
        },

        el: $('#location'),

        render: function () {
            var locationTemplate = _.template($("#location-template").html());
            var latitute = this.model.get("latitute");
            var longitute = this.model.get("longitute");
            if (latitute == -1 || longitute == -1) {
                this.$el.text("Please wait. Trying to determine your location...");
            } else
                this.$el.html(locationTemplate({
                    latitute: latitute,
                    longitute: longitute
                }));
        },

        storePosition: function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            this.model.set({latitute: latitude, longitute: longitude});
        },

        getAndWatchLocation: function (callback) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(callback);
                navigator.geolocation.watchPosition(callback);
            } else {
                this.$el.text("Could not find your location");
            }
        }
    });

    var LocalStopsView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'render');
            this.render();
            this.model.bind('change', this.render);
        },

        el: $('#stops'),

        render: function () {
            var busStopList = this.model.get("busStopList");
            this.$el.html("");
            var busStopTemplate = _.template($("#busstop-template").html());
            var outer = this;
            busStopList.forEach(function (busStop) {
                outer.$el.append(busStopTemplate({distance: busStop.distance, name:busStop.name}));
            });
        }

    });

    var currentLocation = new CurrentLocation();
    var busStopData = new AreaBusStopData({location: currentLocation});
    new LocationView({model: currentLocation});
    new LocalStopsView({model: busStopData});
})
;