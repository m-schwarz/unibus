Backbone.$ = $;

$(function () {
    var CurrentLocation = Backbone.Model.extend({
        defaults: {
            latitute: -1,
            longitute: -1
        }
    });


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
            locationTemplate = _.template($("#location-template").html());
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

    new LocationView({model: new CurrentLocation()});
});