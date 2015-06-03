Backbone.$ = $;

$(function () {

    var resizeToBrowserSize = function () {
        var width = $(window).width();
        var height = $(window).height();

        var size = Math.min(width, height);

        $(".full").height(size + "px").width(size + "px");
    };
    $(window).resize(resizeToBrowserSize);
    resizeToBrowserSize();

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
            busStopList: [],
            distance: 1000
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
                    distance: this.get("distance")
                }, function (jsonBusStopList) {
                    outer.set("busStopList", jsonBusStopList);
                }, "json");
            }
        }
    });

    var BusStopDepartureInformation = Backbone.Model.extend({});

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
                outer.$el.append(busStopTemplate({distance: busStop.distance, name: busStop.name}));
            });
        }

    });

    var CircleView = Backbone.View.extend({
        el: $('#circles'),

        initialize: function () {
            _.bindAll(this, 'render');
            this.render();
        },

        render: function () {
            var svg = $('svg', this.$el);
            svg.html("");
            var circleTemplate = _.template($("#svg-circle-template").html());

            var size = 50;
            var alternatingValue = false;
            while (size > 0) {
                svg.append(circleTemplate({radius: size, fill: alternatingValue ? "#FAFAFA" : "#DFDFDF"}));
                alternatingValue ^= true;
                size -= 10;
            }

            svg.append(circleTemplate({radius: 2, fill: "#555555"}));

            var circleText = _.template($("#svg-circle-text").html());
            svg.append(circleText());

            //Ninja hack. DOM elements will not be treated as SVG before we have done this...
            svg.html(svg.html());
        }

    });

    var BusStopsDotView = Backbone.View.extend({
        el: $('#bus_stops'),

        initialize: function (options) {
            _.bindAll(this, 'render');
            this.render();
            this.model.bind('change', this.render);
            options.location.bind('change', this.render);
            this.location = options.location;
        },

        render: function () {
            var busStopList = this.model.get("busStopList");
            var maxDistance = this.model.get("distance");

            if (busStopList.length) {
                var someBusStop = busStopList[0];

                //Use knowledge from that old Greek guy to find distance in coordX/coordY units
                var latitute = this.location.get("latitute");
                var longitute = this.location.get("longitute");
                var coordXLocation = Math.round(longitute * 1E6);
                var coordXDelta = coordXLocation - someBusStop.coordX;
                var coordYLocation = Math.round(latitute * 1E6);
                var coordYDelta = coordYLocation - someBusStop.coordY;
                var hypotenuseLength = Math.sqrt(Math.pow(coordXDelta, 2) + Math.pow(coordYDelta, 2));

                var coordsPerMeter = hypotenuseLength / someBusStop.distance;

                this.$el.html("");
                var outer = this;

                busStopList.forEach(function (busStop) {
                    var metersXDelta = (coordXLocation - busStop.coordX) / coordsPerMeter;
                    var metersYDelta = (coordYLocation - busStop.coordY) / coordsPerMeter;

                    var busStopTemplate = _.template($("#busstop-dot-template").html());
                    var busStopElement = $(busStopTemplate({
                        left: Math.round(100 - ((metersXDelta / maxDistance * 100) / 2 + 50)),
                        top: Math.round((metersYDelta / maxDistance * 100) / 2 + 50),
                        title: busStop.name + " is " + Math.abs(metersXDelta) + " meters " + (metersXDelta > 0 ? "west" : "east") + " and " + Math.abs(metersYDelta) + " meters " + (metersYDelta < 0 ? "north" : "south")
                    }));
                    outer.$el.append(busStopElement);


                });
            }
        }

    });


    var currentLocation = new CurrentLocation();
    var busStopData = new AreaBusStopData({location: currentLocation});
    new LocationView({model: currentLocation});
    new LocalStopsView({model: busStopData});

    new CircleView();
    new BusStopsDotView({model: busStopData, location: currentLocation});
})
;