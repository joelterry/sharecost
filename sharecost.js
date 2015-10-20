if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

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
