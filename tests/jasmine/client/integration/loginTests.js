describe("Login tests", function() {
    var user = {};
    user._id = "ycMSMjwJYdP9eJD4M";
    user.services = {};
    user.services.venmo = {};
    user.services.venmo.id = "1801145244712960593";
    user.services.venmo.display_name = "Alex Ma";
    user.services.venmo.profile_picture_url = "http://i.imgur.com/bWUTbHl.png";
    user.services.venmo.accessToken = "d2cfc976873ef4ba97bc15915c98b5f3bb8ddd17446ffd5f4b53b760dbec6011";

    beforeEach(function(done) {
        spyOn(Meteor, "user").and.callFake(function() {
            return user;
        });
        spyOn(Meteor, "userId").and.callFake(function() {
            return user._id;
        });
        Router.go("/");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it("plop", function() {
        $("#create").trigger("click");
        expect(Router.current().route.path()).toEqual("/create");
    });
});
