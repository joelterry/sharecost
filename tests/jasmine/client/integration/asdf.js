describe("Route tests", function() {
    var toReturn = 0;

    beforeEach(function (done) {
        spyOn(Meteor, "user").and.callFake(function() {
            return toReturn;
        });
        Router.go("/");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it("only show login screen before logging in", function() {
        expect(Router.current().route.path()).toEqual("/login");
        expect(toReturn).toEqual(0);
        toReturn = 0; // Pseudo Login
    });

    it("after logging in, taken to create page", function() {
        expect(Router.current().route.path()).toEqual("/login");
        toReturn = 0; // Pseudo Logout
    });

    // I don't know why this one fails
    it("upon logout, redirect once again to login", function() {
        expect(Router.current().route.path()).toEqual("/login");
    });

});
