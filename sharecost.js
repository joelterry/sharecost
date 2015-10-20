if (Meteor.isClient) {

  Template.login.events({
    'click #venmo-login': function(event) {
        Meteor.loginWithVenmo({}, function(err){
            if (err) {
                throw new Meteor.Error("Facebook login failed");
            }
        });
    },
 
    'click #logout': function(event) {
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        })
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

		ServiceConfiguration.configurations.remove({
      service: "venmo"
    });

    ServiceConfiguration.configurations.insert({
      service: "venmo",
      clientId: "3008",
      scope: "access_profile+access_friends",
      secret: "s4CH2SZAwKJuLtFvn7eUyEcJMDr5bcbt"
    });

  });
}
