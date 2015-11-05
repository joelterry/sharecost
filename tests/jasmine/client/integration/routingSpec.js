describe("Route tests", function() {
    var toReturn = 0;

    beforeEach(function (done) {
        spyOn(Meteor, "user").and.callFake(function() {
            return toReturn;
        });
        Router.go("/create");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it("only show login screen before logging in", function() {
        expect(Router.current().route.getName()).toEqual("login");
        toReturn = 5; // Pseudo Login
    });

    it("after logging in, taken to create page", function() {
        expect(Router.current().route.getName()).toEqual("create");
        toReturn = 0; // Pseudo Logout
    });

    // I don't know why this one fails
    it("upon logout, redirect once again to login", function() {
        expect(Router.current().route.getName()).toEqual("login");
    });

});
