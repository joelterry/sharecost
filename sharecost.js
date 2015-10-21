if (Meteor.isClient) {

  Template.login.events({
    'click #venmo-login': function(event) {
        Meteor.loginWithVenmo(function (err, res) {
          if (err !== undefined){
            console.log('sucess ' + res);
          }
          else{
            console.log('login failed ' + err);
          }
          Router.go('/');
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

  Template.home.events({
    'click #logout': function(event) {
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        });
        Router.go('/')
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
