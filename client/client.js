/* General client code */

Template.login.events({
  'click #venmo-login': function(event) {
      Meteor.loginWithVenmo(function (err, res) {
        if (err){
        	console.log(err);
          throw new Meteor.Error("Login failed"); 
        }
        Meteor.call("after_login", function(err) {
        	if (err) {
        		throw new Meteor.Error("Unable to update friends.");
        	}
        });
        Router.go('/');
      });
  }
});

Template.home.events({
  'click #create': function(event) {
      Router.go('/create');
  }
});

Template.create.events({
    
});


Template.createPurchase.events({

});

Template.createPurchase.helpers({
  'friends': function() {
    return 
  }
});

var events = {
  'click #logout': function(event) {
    Meteor.logout(function(err){
        if (err) {
            throw new Meteor.Error("Logout failed");
        }
        Router.go('/');
    });
  }
}

Template.BaseLayout.events(events);
Template.home.events(events);
Template.create.events(events);

Template.registerHelper('getProfilePictureUrl', function() {
    var user = Meteor.user();
    return user.services.venmo.profile_picture_url
});

