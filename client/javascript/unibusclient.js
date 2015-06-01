Backbone.$ = $;

$(function () {
    var CurrentLocation = Backbone.Model.extend({
        defaults: {
            latitute: -1,
            longitute: -1
        }
    });

    var currentLocation = new CurrentLocation();

    var LocationView = Backbone.View.extend({

        initialize: function () {
            // binds 'this' for the methods. There clearly must be a more clever way of doing this?
            _.bindAll(this, 'storePosition', 'getAndWatchLocation', 'renderPositionTemplate');
            this.renderPositionTemplate(currentLocation);
            currentLocation.on("change", this.renderPositionTemplate);
            this.getAndWatchLocation(this.storePosition);
        },

        el: $('#location'),

        renderPositionTemplate: function (currentLocation) {
            locationTemplate = _.template($("#location-template").html());
            var latitute = currentLocation.get("latitute");
            var longitute = currentLocation.get("longitute");
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
            currentLocation.set({latitute: latitude, longitute: longitude});
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

    new LocationView();
});