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
Purchases = new Mongo.Collection("purchases");
Friends = new Mongo.Collection("friends");

if (Meteor.isServer) {
  /* Server publishes all purchases with current user as a member */
  Meteor.publish("purchases", function() {
    return Purchases.find({members: { $all : [this.userId] }});
  });
}

if (Meteor.isClient) {
  /* Server publishes all purchases with current user as a member */
  Meteor.subscribe("purchases");
}
