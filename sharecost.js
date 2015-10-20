if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

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

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
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
      scope: "access_profile",
      secret: "s4CH2SZAwKJuLtFvn7eUyEcJMDr5bcbt"
    });

  });
}
