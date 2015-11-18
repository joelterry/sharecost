/* General server code */

Meteor.startup(function () {

	ServiceConfiguration.configurations.remove({
		service: "venmo"
	});

	ServiceConfiguration.configurations.insert({
		service: "venmo",
		clientId: Meteor.settings.VENMO.CLIENT_ID,
		scope: "access_profile+access_friends+make_payments",
		secret: Meteor.settings.VENMO.SECRET
	});

});