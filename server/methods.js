/* Meteor methods to load early*/

if (Meteor.isServer){

	/* Divides total by n. The result is the floor-divided
	 * cost to be split between invited members. At this point,
	 * the creator is expected to pick up the possible remainder of cents. */
	var split_cost = function(total, n) {
		return Number((Math.floor((total * 100) / n) / 100).toFixed(2));
	}

	/* Checks if the user with 'venmo_id' can vote on 'purchase.' */
	var valid_vote = function(venmo_id, purchase) {
		/* Checking membership */
		if (purchase.members.indexOf(venmo_id) == -1) {
			throw new Meteor.Error("Error, attempt to vote on a purchase that doesn't involve the logged-in user.");
		}
		/* Checking that user hasn't already accepted purchase. */
		if (purchase.accepted.indexOf(venmo_id) != -1) {
			throw new Meteor.Error("Error, attempt to vote on a purchase that the user already accepted.");
		}
		/* Checking that user hasn't already rejected purchase. */
		if (purchase.rejected.indexOf(venmo_id) != -1) {
			throw new Meteor.Error("Error, attempt to vote on a purchase that the user already rejected.");
		}
	}

	Meteor.methods({
		/* Retrieves the current user's venmo friends. Currently only makes one GET request
		 * for a maximum of 2000 friends. We might need to account for pagination. */
		'get_venmo_friends': function() {
			this.unblock(); //allows other Methods to run, since I'm doing HTTP.get() synchronously
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
				throw new Meteor.Error("Error with GET");
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
		/* Makes a Venmo payment of 'amount' from the current user to 'userId'. */
		'pay_user': function(userId, amount){
			this.unblock(); //allows other Methods to run, since we're doing HTTP.post() synchronously
			var user = Meteor.user();
			if (!user) {
				throw new Meteor.Error("Couldn't retrieve Venmo friends; user is not logged in.");
			}
			var venmo_id = userId;
			var access = user.services.venmo.accessToken;
			var url = "https://api.venmo.com/v1/payments";
			try {
				var result = HTTP.post(url,
								{params: {access_token: access,
											user_id: venmo_id,
											note: "test",
											amount: amount}});
				return result;
			} catch (e) {
				console.log(e);
				throw new Meteor.Error("Error with POST");
			}
		},
		/* Called when a purchase that the current user is a member of has been unanimously approved.
		 * Either triggers upon login, or at the moment of approval (if member is logged in). */
		'process_purchase': function(purchase_id) {
			var purchase = Purchases.findOne(purchase_id);
			var venmo_id = Meteor.user().services.venmo.id;
			/* Checking votes */
			if (purchase.rejected.length > 0) {
				throw new Meteor.Error("Can't process this purchase, somebody rejected it.");
			}
			if (purchase.accepted.length < purchase.members.length) {
				throw new Meteor.Error("Can't process a purchase until everyone has voted in favor of it.");
			}
			/* Checking membership */
			if (purchase.members.indexOf(venmo_id) == -1) {
				throw new Meteor.Error("Error, attempt to process a purchase that doesn't involve the logged-in user.");
			}
			/* Splitting cost */
			var split = split_cost(purchase.cost, purchase.members.length + 1);
			/* Attempting to make Venmo transaction to creator of purchase */
			var response = Meteor.call('pay_user', purchase.creator, split);
			/* If the Venmo transaction went through, add user to the list of users who have paid (purchase.paid) */
			if (response.data.payment.status == "settled") {
				Purchases.update(purchase_id, {$push: {paid: venmo_id}});
			} else {
				throw new Meteor.Error("Error, Venmo failed to process the purchase.");
			}
		},
		'accept_purchase': function(purchase_id) {
			var purchase = Purchases.findOne(purchase_id);
			var venmo_id = Meteor.user().services.venmo.id;
			valid_vote(venmo_id, purchase);
			Purchases.update(purchase_id, {$push: {accepted: venmo_id}});
		},
		'reject_purchase': function(purchase_id) {
			var purchase = Purchases.findOne(purchase_id);
			var venmo_id = Meteor.user().services.venmo.id;
			valid_vote(venmo_id, purchase);
			Purchases.update(purchase_id, {$push: {rejected: venmo_id}});
		},
		'pay_sandbox': function(){
			var user = Meteor.user();
			if (!user) {
				throw new Meteor.Error("Couldn't retrieve Venmo friends; user is not logged in.");
			}
			var venmo_id = "145434160922624933";
			var access = user.services.venmo.accessToken;
			var url = "https://sandbox-api.venmo.com/v1/payments";
			var req = HTTP.call("POST", url, 
								{params: {access_token: access, user_id: venmo_id, note: "test", amount: 0.1}},
								function(error, result){
									if(error){
										console.log(error);
										throw new Meteor.Error("Error with POST");
									} else {
										console.log(result);
										return result;
									}
								});

		}

	});
}
