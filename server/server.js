/* General server code */

Meteor.methods({
	'get_venmo_friends': function() {
		this.unblock(); //allows other Methods to run, since I'm doing http.get() synchronously
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error("Couldn't retrieve Venmo friends; user is not logged in.");
		}
		var venmo_id = user.services.venmo.id;
		var access = user.services.venmo.accessToken; //assuming that user has access_token field as defined in design doc
		var url = "https://api.venmo.com/v1/users/" + venmo_id + "/friends";
		try {
			var result = HTTP.get(url, {"params": {"access_token": access, "limit": 2000}});
			console.log(result);
			return result.data;
		} catch (e) {
			console.log(e);
			return null
		}
	} 
});