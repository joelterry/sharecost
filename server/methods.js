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

	/* Checks if 'purchase' is ready to be processed (unanimous vote in favor). */
	var valid_purchase = function(purchase) {
		if (purchase.rejected.length > 0) {
			throw new Meteor.Error("Can't process this purchase, somebody rejected it.");
		}
		if (purchase.accepted.length < purchase.members.length) {
			throw new Meteor.Error("Can't process a purchase until everyone has voted in favor of it.");
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
			/* If the user doesn't have the purchases field, add it.
			 * This is fired each time the user logs in, maybe there's a 
			 * better way to do this? The venmo-oauth package seems to 
			 * take care of user creation for us, so I'm not sure. */
			if (Meteor.user().purchases == undefined) {
				Meteor.users.update(Meteor.userId(), {$set: {purchases: {created: [], invited: []}}});
			}
		},
		/* Makes a Venmo payment of 'amount' from srcUser (app ID) to dstVenmo (venmo ID). */
		'user_pay_user': function(srcUser, dstVenmo, amount) {
			this.unblock(); //allows other Methods to run, since we're doing HTTP.post() synchronously
			var user = Meteor.users.findOne(srcUser);
			if (!user) {
				throw new Meteor.Error("Invalid user");
			}
			var venmo_id = dstVenmo;
			var access = user.services.venmo.accessToken;
			var url = "https://api.venmo.com/v1/payments";
			try {
				var result = HTTP.post(url,
								{params: {access_token: access,
											user_id: venmo_id,
											note: Math.random().toString(),
											amount: amount}});
				return result;
			} catch (e) {
				console.log(e);
				throw new Meteor.Error("Error with POST");
			}
		},
		/* Makes a Venmo payment of 'amount' from the current user to 'venmoId'. */
		'pay_user': function(venmoId, amount){
			this.unblock(); //allows other Methods to run, since we're doing HTTP.post() synchronously
			return Meteor.call("user_pay_user", Meteor.userId(), venmoId, amount);
		},
		/* Converts a list of venmo ids into a list of respective app ids.
		 * Throws an error if any of the venmo members aren't signed up for the app. */
		'venmo_ids_to_ids': function(vids) {
			var result = [];
			vids.forEach(function(vid) {
				var user = Meteor.users.findOne({'services.venmo.id': vid});
				if (!user) {
					throw new Meteor.Error("Error: one of these Venmo members hasn't signed up for ShareCost.");
				}
				result.push(user._id);
			});
			return result;
		},
		/* Adds a purchase id to each app user (according to their venmo id).
		 * Uses venmo_ids_to_ids as a helper.
		 * Throws an error (via helper) if any of the venmo members aren't signed up for the app.  */
		'send_purchase': function(pid, vids) {
			var ids = Meteor.call("venmo_ids_to_ids", vids);
			Meteor.users.update({_id: {$in: ids}}, {$push: {'purchases.invited': pid}});
		},
		/* Adds a purchase id to the current user's purchase.created.
		 * I made this because Meteor won't let me do it client-side. */
		'own_purchase': function(pid) {
			Meteor.users.update(Meteor.userId(), {$push: {'purchases.created': pid}});
		},
		/* Called once a purchase has been unanimously approved, and attempts to
		 * process all payments at once. Checks if members have already paid,
		 * so can hypothetically be called more than once. */
		'process_group_purchase': function(purchase_id) {
			var purchase = Purchases.findOne(purchase_id);
			valid_purchase(purchase);
			/* Splitting cost */
			var split = split_cost(purchase.cost, purchase.members.length + 1);
			purchase.members.forEach(function(venmo_id){
				if (purchase.paid.indexOf(venmo_id) != -1) {
					return;
				}
				/* Need app id, since that's what "user_pay_user" takes for the payer. */
				var id = Meteor.users.findOne({'services.venmo.id': venmo_id})._id;
				var response = Meteor.call("user_pay_user", id, purchase.creator, split);
				if (response.data.data.payment.status == "settled") {
					Purchases.update(purchase_id, {$push: {paid: venmo_id}})
				}
			});

		},
		/* Called when a purchase that the current user is a member of has been unanimously approved.
		 * Either triggers upon login, or at the moment of approval (if member is logged in).
		 *
		 * NOTE: This hasn't been used yet. I'm not sure if purchases should be processed
		 * once as a group, or individually when invited members are logged in. If it's the
		 * former, then process_group_purchase() should be used instead.  */
		'process_purchase': function(purchase_id) {
			var purchase = Purchases.findOne(purchase_id);
			var venmo_id = Meteor.user().services.venmo.id;

			valid_purchase(purchase);
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
			/* Process payment if there has been unanimous acceptance. */
			var purchase = Purchases.findOne(purchase_id);
			if (purchase.accepted.length == purchase.members.length) {
				Meteor.call("process_group_purchase", purchase_id);
			}
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
