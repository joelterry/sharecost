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

}

if (Meteor.isServer) {

  /* Server publishes all purchases with current user as a member */
  Meteor.publish("purchases", function() {
    return Purchases.find({members: { $all : [this.userId] }});
  });

}
