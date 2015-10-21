/* General client code */

Template.login.events({
  'click #venmo-login': function(event) {
      Meteor.loginWithVenmo(function (err, res) {
        if (err) {
          console.log(err);
          throw new Meteor.Error("Login failed");
      	}
        console.log('sucess ' + res);
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

Template.createPurchase.events({

});

Template.createPurchase.helpers({
  'friends': function() {
    return 
  }
});
