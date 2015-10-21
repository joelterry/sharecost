/* General server code */

Meteor.startup(function () {

	var clientId;
	var secret;

	if (process.env.NODE_ENV == "development"){
		clientId = "3008";
		secret = "s4CH2SZAwKJuLtFvn7eUyEcJMDr5bcbt";
	} else {
		clientId = "3018";
		secret = "YaCkWypcB6AGYd7xjcYmFwVrtVTDybAm";
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