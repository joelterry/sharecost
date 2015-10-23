describe("Route tests", function() {
  beforeEach(function (done) {
    Router.go("/create");
    Tracker.afterFlush(done);
  });

  beforeEach(waitForRouter);

  /*afterEach(function(done) {
    if (Meteor.user()) {
      Meteor.logout(function() {
        done();
      });
    }
  });*/

  it("only show login screen before logging in", function() {
    if (!Meteor.user()) {
      expect(Router.current().route.getName()).toEqual("login");
    }
  });

  //use a mock for login? redirect URL is mirrored (I think)
  /*it("logging in redirects to homepage", function() {
    Meteor.loginWithVenmo("element0flight@gmail.com", "Abc12345", function(err) {
      expect(err).toBeUndefined();
      expect(Meteor.userId()).not.toBeNull();
      expect(Router.current().route.getName()).toEqual("home");
    });
  });*/
});
