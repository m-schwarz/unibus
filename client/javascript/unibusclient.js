Backbone.$ = $;

$(function () {

    var resizeToBrowserSize = function () {
        var width = $(window).width();
        var height = $(window).height();

        var size = Math.min(width, height) - 10;

        $(".full").height(size + "px").width(size + "px");
    };
    $(window).resize(resizeToBrowserSize);
    resizeToBrowserSize();

    /*
     * Model definitions for the bus app
     */

    /**
     * The CurrentLocation location model  represents the current geolocation of the user.
     * This model is updated when the geolocation changes.
     */
    var CurrentLocation = Backbone.Model.extend({
        defaults: {
            latitute: -1,
            longitute: -1
        },

        initialize: function () {
            _.bindAll(this, 'storePosition', 'getAndWatchLocation');
            this.getAndWatchLocation(this.storePosition);
        },

        storePosition: function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            this.set({latitute: latitude, longitute: longitude});
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

    /**
     * The AreaBusStopData model represents the set of bus stops in the area. This model is updated when
     * CurrentLocation changes and the data is populated using data from the server side of the application
     * (essentially by contacting the server endpoint).
     */
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

    /**
     * The SelectedBusStop  represents the (in the interface) currently selected bus stop.
     * This model is populated with departure information (from the server side) whenever the bus stop selection changes.
     */
    var SelectedBusStop = Backbone.Model.extend({
        defaults: {
            selectedBusStop: undefined,
            nextDepartures: []
        },

        initialize: function () {
            _.bindAll(this, 'updateNextDeparturesData');
            this.bind('change:selectedBusStop', this.updateNextDeparturesData);
            this.updateNextDeparturesData();
        },

        updateNextDeparturesData: function () {
            var selectedBusStop = this.get("selectedBusStop");
            if (selectedBusStop) {
                var outer = this;
                $.get("service/nextDepartures", {
                        departureBoardId: selectedBusStop.id
                    }
                    , function (nextDepartures) {
                        outer.set("nextDepartures", nextDepartures);
                    }, "json");
            }
        }
    });


    /*
     * View definitions for the bus app
     */

    /**
     * The CircleView gives a radar-like graphical view of distances using concentric circles in alternating colors.
     * The CircleView is generated using SVG and is in its current form relatively static.
     */
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

    /**
     * The BusStopsRadarView which populates the CircleView (visually) with nearby bus stops.
     * The BusStopsRadarView is updated when AreaBusStopData changes.
     */
    var BusStopsRadarView = Backbone.View.extend({
        el: $('#bus_stops'),

        initialize: function (options) {
            _.bindAll(this, 'render');
            this.render();
            this.model.bind('change', this.render);
            options.location.bind('change', this.render);
            this.location = options.location;
            this.selectedBusStop = options.selectedBusStop;
        },

        render: function () {
            var busStopList = this.model.get("busStopList");
            var maxDistance = this.model.get("distance");

            if (busStopList.length) {
                var someBusStop = busStopList[0];

                /* Use knowledge from that old Greek guy to find distance in coordX/coordY degrees (or actually millionths of degrees)

                 * NOTICE: Since degrees and meters are not proportional, this computation is only correct
                 * when we look at relatively small distances (< ~hundreds of miles) and the value only
                 * holds locally (a degree corresponds to more meters in Italy that it does in Denmark).
                 * -- Both prerequisites holds for the use in this application. --
                 */
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
                    busStopElement.on("click", function () {
                        outer.selectedBusStop.set("selectedBusStop", busStop);
                    });
                    setTimeout(function () {
                        busStopElement.css("opacity", "1");
                    }, Math.random() * 300 + 100);
                    outer.$el.append(busStopElement);


                });
            }
        }

    });

    /**
     * The BusStopNextDeparturesView lists upcoming departures form the selected bus stop. The BusStopNextDeparturesView is
     * updated when the SelectedBusStop changes.
     */
    var BusStopNextDeparturesView = Backbone.View.extend({
        el: $('#next_busses'),

        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.selectedBusStop = options.selectedBusStop;
            this.selectedBusStop.bind('change', this.render);
            $(".next_busses", this.$el).hide();
            this.render();
        },

        render: function () {
            var nextBussesElement = $(".next_busses", this.$el);
            nextBussesElement.html("");
            var selectedBusStop = this.selectedBusStop.get("selectedBusStop");
            var nextDepartures = this.selectedBusStop.get("nextDepartures");

            if (selectedBusStop) {
                var element;
                if (nextDepartures.length) {
                    var nextBussesTemplate = _.template($("#next-busses-template").html());
                    var rows = "";
                    nextDepartures.forEach(function (departure, index) {
                        var nextBussesRowTemplate = _.template($("#next-busses-row-template").html());
                        rows += nextBussesRowTemplate({
                            depTime: departure.date + " " + departure.time,
                            name: departure.name,
                            direction: departure.direction,
                            style: index % 2 ? "even" : "odd"
                        });
                    });

                    element = $(nextBussesTemplate({name: selectedBusStop.name, rows: rows}));
                } else {
                    var nextBussesEmptyTemplate = _.template($("#next-busses-template-empty").html());
                    element = $(nextBussesEmptyTemplate({name: selectedBusStop.name}));
                }
                element.on("click", function () {
                    nextBussesElement.hide();
                });
                nextBussesElement.html(element);
                nextBussesElement.show();
            }
        }

    });

    /*
     * Set up interconnections between views and model.
     */

    //Set up models
    var currentLocation = new CurrentLocation();
    var busStopData = new AreaBusStopData({location: currentLocation});
    var selectedBusStop = new SelectedBusStop();

    //Set up views and their bindings to the models.
    new CircleView();
    new BusStopsRadarView({model: busStopData, location: currentLocation, selectedBusStop: selectedBusStop});
    new BusStopNextDeparturesView({model: selectedBusStop, selectedBusStop: selectedBusStop});
});