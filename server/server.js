/* General server code */

Meteor.startup(function () {

  ServiceConfiguration.configurations.remove({
    service: "venmo"
  });

  ServiceConfiguration.configurations.insert({
    service: "venmo",
    clientId: "3008",
    scope: "access_profile+access_friends+make_payments",
    secret: "s4CH2SZAwKJuLtFvn7eUyEcJMDr5bcbt"
  });

});