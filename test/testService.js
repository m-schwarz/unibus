/**
 * Created by schwarz on 01/06/15.
 */
var assert = require("assert");
var service = require("../server/service");

describe("Service", function () {
    it("should be able to get list of stops", function (done) {
            service.getStopsInArea(12565796, 55673063, 1000, function (locations) {
                assert.notEqual(locations.length, 0);
                locations.forEach(function (location) {
                    assert.notEqual(location.id, undefined);
                    assert.notEqual(location.name, undefined);
                    assert.notEqual(location.coordX, undefined);
                    assert.notEqual(location.coordY, undefined);
                    assert.notEqual(location.distance, undefined);
                });
                done();
            });
        }
    );

    it("should be able to list departures from a bus stop", function (done) {
        // Find the nearest stop and see if we can get departure information for it...
        service.getStopsInArea(12565796, 55673063, 1000, function (locations) {
            service.getNextDepartures(locations[0].id, function (departures) {
                assert.notEqual(departures.length, 0);
                departures.forEach(function (departure) {
                    assert.notEqual(departure.date, undefined);
                    assert.notEqual(departure.time, undefined);
                    assert.notEqual(departure.stop, undefined);
                    assert.notEqual(departure.finalStop, undefined);
                    assert.notEqual(departure.direction, undefined);
                    assert.notEqual(departure.detailsId, undefined);
                });
                done();
            });
        });
    });

    it("should be able to list journey stops", function (done) {
        service.getStopsInArea(12565796, 55673063, 1000, function (locations) {
            service.getNextDepartures(locations[0].id, function (departures) {
                departures.forEach(function(departure){
                    service.getJourneyDetails(departure.detailsId, function (stops) {
                        assert.notEqual(stops.length, 0);
                        stops.forEach(function (stop) {
                            assert.notEqual(stop.depTime, undefined);
                            assert.notEqual(stop.depDate, undefined);
                            assert.notEqual(stop.arrTime, undefined);
                            assert.notEqual(stop.arrDate, undefined);
                            assert.notEqual(stop.arrDate, undefined);
                            assert.notEqual(stop.coordX, undefined);
                            assert.notEqual(stop.coordY, undefined);
                        });
                    });
                });
                done();
            });
        });
    });
});