/*
id: int
title: “”
description: “”
creator: id
members: {id: vote_status, …}
cost: number
created_at: number
venmo_responses: { }
*/
var Purchases = new Mongo.Collection("purchases");



if (Meteor.isClient) {

  Meteor.subscribe("purchases"); //should maybe wait until signed in?

  Template.login.events({
    'click #venmo-login': function(event) {
        Meteor.loginWithVenmo(function (err, res) {
          if (err !== undefined)
            console.log('sucess ' + res)
          else
            console.log('login failed ' + err)
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

  Template.createPurchase.events({

  });

  Template.createPurchase.helpers({
    'friends': function() {
      return 
    }
  });

  Meteor.call("get_venmo_friends", function(error, result) {
    console.log(result);
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

    /* Server publishes all purchases with current user as a member */
    Meteor.publish("purchases", function() {
      return Purchases.find({members: { $all : [this.userId] }});
  });


  });

}
