/**
 * Created by schwarz on 05/06/15.
 */

var assert = require("assert");
var app = require("../server/app");

describe("App", function () {
    it("should cache the result of getNextDepartures", function (done) {
        // Find the nearest stop and see if we can get departure information for it...
        app.getStopsInArea(12565796, 55673063, 1000, function (locations) {
            app.getNextDepartures(locations[0].id, function (departures) {
                app.getStopsInArea(12565796, 55673063, 1000, function (locations2) {
                    app.getNextDepartures(locations[0].id, function (departures2) {
                        assert.strictEqual(departures, departures2);
                        done();
                    });
                });
            });
        });
    });

    it("should not mix caches the result of getNextDepartures", function (done) {
        // Find the nearest stop and see if we can get departure information for it...
        app.getStopsInArea(12565796, 55673063, 1000, function (locations) {
            app.getNextDepartures(locations[0].id, function (departures) {
                app.getStopsInArea(12565796, 55673063, 1000, function (locations2) {
                    app.getNextDepartures(locations[1].id, function (departures2) {
                        assert.notStrictEqual(departures, departures2);
                        done();
                    });
                });
            });
        });
    });

    it("should cache the result of getStopsInAreay", function (done) {
        // Find the nearest stop and see if we can get departure information for it...
        app.getStopsInArea(12565796, 55673063, 1000, function (locations) {
            app.getStopsInArea(12565796, 55673063, 1000, function (locations2) {
                assert.strictEqual(locations, locations2);
                done();
            });
        });
    });

    it("should not mix caches of the result of getStopsInAreay", function (done) {
        // Find the nearest stop and see if we can get departure information for it...
        app.getStopsInArea(12565796, 55673042, 1000, function (locations) {
            app.getStopsInArea(12565796, 55673063, 1000, function (locations2) {
                assert.notStrictEqual(locations, locations2);
                done();
            });
        });
    });
});