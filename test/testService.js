/**
 * Created by schwarz on 01/06/15.
 */
var assert = require("assert");
var service = require("../server/service");

describe("Service", function () {
    it("should be able to fetch stops", function (done) {
            service.getStopsInArea(12565796, 55673063, 1000, function (locations) {
                locations.forEach(function(location) {
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
});