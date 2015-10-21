/* Meteor methods to load early*/

Meteor.methods({
	/* Retrieves the current user's venmo friends. Currently only makes one GET request
	 * for a maximum of 2000 friends. We might need to account for pagination. */
	'get_venmo_friends': function() {
		this.unblock(); //allows other Methods to run, since I'm doing http.get() synchronously
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error("Couldn't retrieve Venmo friends; user is not logged in.");
		}
		var venmo_id = user.services.venmo.id;
		var access = user.services.venmo.accessToken;
		var url = "https://api.venmo.com/v1/users/" + venmo_id + "/friends";
		try {
			var result = HTTP.get(url, {"params": {"access_token": access, "limit": 2000}});
			return result.data.data;
		} catch (e) {
			console.log(e);
			return null
		}
	},
	/* Performs some additional setup after the user logs in,
	 * including updating the user's friend list. */
	'after_login': function() {
		/* Update the user's friend list */
		Meteor.call('get_venmo_friends', function(err, res) {
			if (err) {
				throw new Meteor.Error("Unable to retrieve Venmo friends.");
			}
			Friends.upsert(Meteor.userId(), {$set: {'venmo_friends': res}});
		});
	},

	'venmoPaySandbox': function(accessToken){
		this.unblock();
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error("Couldn't retrieve Venmo friends; user is not logged in.");
		}
	}
});