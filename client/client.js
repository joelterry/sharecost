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
},

'click #logout': function(event) {
    Meteor.logout(function(err){
        if (err) {
            throw new Meteor.Error("Logout failed");
        }
    });
}
});

Template.home.events({
  'click #logout': function(event) {
      Meteor.logout(function(err){
          if (err) {
              throw new Meteor.Error("Logout failed");
          }
          Router.go('/');
      });
  },

  'click #create': function(event) {
      Router.go('/create');
  }
});

Template.home.helpers({
    'getProfilePictureUrl': function() {
        var user = Meteor.user();
        return user.services.venmo.profile_picture_url
    }
});

Template.create.events({
    'click #pay-sandbox': function(event) {
        ret = Meteor.call("pay_sandbox");
    }
});


Template.createPurchase.events({

});

Template.createPurchase.helpers({
  'friends': function() {
    return 
  }
});
