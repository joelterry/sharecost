"use strict";
describe("Tutorial", function () {
    it("should be created with name and capacity", function () {
        spyOn(Tutorials, "insert").and.callFake(function(doc, callback) {
            // simulate async return of id = "1";
            callback(null, "1");
        });
 
        var tutorial = new Tutorial(null, "Tutorial 1", 20);
 
        expect(tutorial.name).toBe("Tutorial 1");
        expect(tutorial.capacity).toBe(20);
 
        tutorial.save();
 
        // id should be defined
        expect(tutorial.id).toEqual("1");
        expect(Tutorials.insert).toHaveBeenCalledWith({name: "Tutorial 1", capacity: 20}, jasmine.any(Function));
    });
});
