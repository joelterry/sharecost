/*
===Purchase Schema===
_id: int
title: “”
description: “”
creator: venmo_id
members: [venmo_id, ...] NOTE: must be at least 1 long
accepted: [venmo_id, ...]
rejected: [venmo_id, ...]
member_names: {venmo_id: name, ...} NOTE: for display purposes
paid: [venmo_id, ...]
cost: number
created_at: number
venmo_responses: { }  NOTE: should we have this?
*/

/*
===Messages Schema===
_id: int
purchase_id: id (_id of unique Purchase field)
creator: ""
title: ""
message: ""
created_at: number
*/


Purchases = new Mongo.Collection("purchases");
Friends = new Mongo.Collection("friends");
Messages = new Mongo.Collection("messages");

if (Meteor.isServer) {
  /* Server publishes all purchases with current user as a member */
  Meteor.publish("purchases", function() {
    return Purchases.find({members: { $all : [this.userId] }});
  });
  //Server publishes all messages
  Meteor.publish("messages", function(){
    return Messages.find();
  });


  /* Helper for validating strings. min and max are inclusive.
   * Returns null if valid, an array of error messages if not. */
  var check_string = function(name, text, min, max) {
    var errors = [];
    if (typeof text != "string") {
      errors.push(name + " should be a string.");
    } else if (text.length < min) {
      errors.push(name + " should be more than " + min + " characters.");
    } else if (text.length > max) {
      errors.push(name + " should be less than " + max + " characters.");
    }
    return errors;
  }

  /* Methods for testing data validity */
  Meteor.methods({
    /* Checks that 'purchase' is valid.
     * Returns null if valid, an array of error messages if not. */
    'check_purchase': function(purchase) {
      var TITLE_MIN = 1;
      var TITLE_MAX = 64;
      var DESC_MIN = 0;
      var DESC_MAX = 256;
      var PURCH_MIN = 1;
      var PURCH_MAX = 10;

      var errors = [];
      errors = errors.concat(check_string("Title", purchase.title, TITLE_MIN, TITLE_MAX),
        check_string("Description", purchase.description, DESC_MIN, DESC_MAX));
      
      if (typeof purchase.cost != "number" || purchase.cost.toString() == "NaN") {
        errors.push("Cost should be a number.");
      }

      if (purchase.members.length < PURCH_MIN) {
        errors.push("There should be at least one invited friend.");
      } else if (purchase.members.length > PURCH_MAX) {
        errors.push("No more than 10 friends allowed.");
      }

      return errors;
    },
    'check_message': function(message){
      var TITLE_MIN = 1;
      var TITLE_MAX = 64;
      var DESC_MIN = 0;
      var DESC_MAX = 256;


    }
  });

}

if (Meteor.isClient) {
  /* Server publishes all purchases with current user as a member */
  Meteor.subscribe("purchases");
  Meteor.subscribe("messages");
}
