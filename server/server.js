/* General server code */

Meteor.startup(function () {

	if (process.env.NODE_ENV === "development"){
		var clientId = "3008";
		var secret = "s4CH2SZAwKJuLtFvn7eUyEcJMDr5bcbt";
	} else {
		var clientId = "3018";
		var secret = "YaCkWypcB6AGYd7xjcYmFwVrtVTDybAm";
	}

	ServiceConfiguration.configurations.remove({
		service: "venmo"
	});

	ServiceConfiguration.configurations.insert({
		service: "venmo",
		clientId: clientId,
		scope: "access_profile+access_friends+make_payments",
		secret: secret
	});

});