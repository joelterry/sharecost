/* General client code */

Template.login.events({
	'click #venmo-login': function(event) {
		Meteor.loginWithVenmo({loginStyle:"redirect"}, function (err, res) {
			if (err){
				Session.set('errorMessage', err.reason || 'Unknown error');
			}
			Meteor.call("after_login", function(err) {
				if (err) {
					throw new Meteor.Error("Unable to update friends.");
				}
			});
			Router.go('/');
		});
	}
});

Template.home.events({
	'click #create': function(event) {
		Router.go('/create');
	}
});

Template.home.helpers({
	'createdPurchases': function(){
		var user = Meteor.user();
		/* Need to check that purchases has been published */
		if (user.purchases) {
			var ids = user.purchases.created;
			return Purchases.find({_id: {$in: ids}});
		} else {
			return null;
		}
	},
	'invitedPurchases': function(){
		var user = Meteor.user();
		/* Need to check that purchases has been published */
		if (user.purchases) {
			var ids = user.purchases.invited;
			return Purchases.find({_id: {$in: ids}});
		} else {
			return null;
		}
	}
});

Template.create.onRendered(function() {
	Session.set("selectedFriends", []);
	var friends = Friends.findOne(Meteor.userId()).venmo_friends;
	var auto_friends = friends.map(function(elem) {
		return {
			/* Venmo id, not app id */
			'id': elem.id,
			'label': elem.display_name,
			'icon': elem.profile_picture_url
		}
	});
	/* jQuery UI autocomplete */
	$("#friends-autocomplete").autocomplete({
		source: auto_friends,
		focus: function( event, ui ) {
			$("#friends-autocomplete").val( ui.item.label );
			return false;
		},
		select: function( event, ui ) {
			var arr = Session.get("selectedFriends");
			arr.push(ui.item);
			Session.set("selectedFriends", arr);
			$("#friends-autocomplete").val('');
			return false;
		} 
	});
});


Template.create.events({
	/* Purchase creation via form submission */
	'submit': function(event) {
		event.preventDefault();

		var selected = Session.get("selectedFriends");
		var purch = {};
		purch.title = event.target.title.value;
		purch.description = event.target.description.value;
		purch.cost = Number(event.target.cost.value);
		purch.creator = Meteor.user().services.venmo.id;
		purch.members = selected.map(function(elem){return elem.id});
		purch.accepted = [];
		purch.rejected = [];
		purch.paid = [];
		purch.created_at = new Date();

		var member_names = {};
		selected.forEach(function(elem){
			member_names[elem.id] = elem.label;
		});
		member_names[purch.creator] = Meteor.user().services.venmo.display_name;
		purch.member_names = member_names;

		Meteor.call("check_purchase", purch, function(err, res) {
			if (res.length > 0) {
				alert("ERROR:\n" + res.join("\n"));
			} else {
				/* Add the purchase to the Purchases collection */
				var pid = Purchases.insert(purch);
				/* Add the purchase ID to the creator's list of invited members.
				 * If an invited venmo member isn't a member of ShareCost, then
				 * abort, and remove the purchase. */
				Meteor.call("send_purchase", pid, purch.members, function(error, result) {
					if (error) {
						Purchases.remove(pid);
						alert("Purchase creation failed! Some of the invited friends haven't signed up for ShareCost.");
					} else {
						/* Add the purchase ID to the creator's list of created purchases */
						Meteor.call("own_purchase", pid);
						Router.go('purchase.show', {_id: pid});
					}
				});
			}
		});
	},
	'click .delete-friend': function(event) {
		var id = $(event.target).parents("li").attr("id");
		var arr = Session.get("selectedFriends");
		/* Pretty disgusting way to "delete" something, sorry I was in a hurry. */
		var new_arr = [];
		arr.forEach(function(elem){
			if (elem.id != id) {
				new_arr.push(elem);
			}
		});
		Session.set("selectedFriends", new_arr);
	}
});

Template.create.helpers({
	'selectedFriends': function() {
		return Session.get("selectedFriends");
	}
});


Template.purchaseProposal.helpers({
	'getPurchaseRoute': function() {
		return "/purchase/" + this._id;
	}
});

/*Global Events*/
var events = {
	'click #logout': function(event) {
		Meteor.logout(function(err){
			if (err) {
				throw new Meteor.Error("Logout failed");
			}
			Router.go('/');
		});
	},
	'click #accept-butt': function(event) {
		var purch_id = Template.instance().data._id;
		Meteor.call("accept_purchase", purch_id, function(err, res) {
			if (err) {
				console.log(err);
			}
		});
	},
	'click #reject-butt': function(event) {
		var purch_id = Template.instance().data._id;
		Meteor.call("reject_purchase", purch_id, function(err, res) {
			if (err) {
				console.log(err);
			}
		});
	}
}

Template.BaseLayout.events(events);
Template.ShowPurchase.events(events);
Template.purchaseProposal.events(events);

/*Global Helpers*/
Template.registerHelper('getProfilePictureUrl', function() {
	var user = Meteor.user();
	if (user.services && user.services.venmo)
		return user.services.venmo.profile_picture_url;
});
Template.registerHelper('getCreatorName', function() {
	return this.member_names[this.creator];
});
/* Returns true if the creator of this purchase is logged in. */
Template.registerHelper('isCreator', function() {
	return this.creator == Meteor.user().services.venmo.id;
});
Template.registerHelper('getAcceptedNames', function() {
	var purch = this;
	return purch.accepted.map(function(elem){
		return purch.member_names[elem];
	});
});
Template.registerHelper('getRejectedNames', function() {
	var purch = this;
	return purch.rejected.map(function(elem){
		return purch.member_names[elem];
	});
});
Template.registerHelper('getPendingNames', function() {
	var purch = this;
	var a = purch.accepted;
	var r = purch.rejected;
	var pending = [];
	/* Disgusting rendition of a set difference */
	purch.members.forEach(function(member) {
		if (a.indexOf(member) == -1 && r.indexOf(member) == -1) {
			pending.push(member);
		}
	});
	return pending.map(function(elem){
		return purch.member_names[elem];
	});
});