/* General client code */

Template.login.events({
	'click #venmo-login': function(event) {
		Meteor.loginWithVenmo({loginStyle:"popup"}, function (err, res) {
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
		purch.split = {};
		purch.created_at = new Date();
		purch.messages = [];

		var member_names = {};
		selected.forEach(function(elem){
			member_names[elem.id] = elem.label;
		});
		member_names[purch.creator] = Meteor.user().services.venmo.display_name;
		purch.member_names = member_names;
		var evenShare = Number((Math.floor((purch.cost * 100) / (purch.members.length + 1)) / 100).toFixed(2));
		$(event.target).find("li").each(function() {
			if (!event.target.unevenSplit.checked) {
				if ($(this).attr("id") != "me") {
					purch.split[$(this).attr("id")] = Number($(this).find(".cost-share").val());
				}
			}
			else {
				purch.split[$(this).attr("id")] = evenShare;
			}
		});
		if (event.target.unevenSplit.checked) {
			purch.split[purch.creator] = evenShare;
		}
		else {
			purch.split[purch.creator] = Number($("#me").find(".cost-share").val());
		}

		Meteor.call("check_purchase", purch, function(err, res) {
			if (res.length > 0) {
				alert("ERROR:\n" + res.join("\n"));
			} else {
				/* Add the purchase to the Purchases collection */
				var pid = Purchases.insert(purch);
				/* Add the purchase ID to the creator's list of invited members.
				 * If an invited venmo member isn't a member of ShareCost, then
				 * abort, and remove the purchase. */
				Meteor.call("send_purchase", pid, purch, function(error, result) {
					if (result.length != 0) {
						Purchases.remove(pid);
						var pending_purchase = {"purchase" : purch, "pending_members" : []};
						var pending_id = PendingPurchases.insert(pending_purchase);
						for (i = 0; i < result.length; i++) {
							PendingUsers.upsert(result[i], {$push: {"purchases": pending_id}});
							PendingPurchases.upsert(pending_id, {$push: {"pending_members" : result[i]}});
						}
						//alert("Purchase creation failed! Some of the invited friends haven't signed up for ShareCost.");
					} else {
						/* Add the purchase ID to the creator's list of created purchases */
						Meteor.call("own_purchase", pid, Meteor.userId());
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
	},
	'click .cost-checkbox': function(event) {
		if ($(event.target).prop("checked")) {
			$(".cost-share").hide();
			$(".hide-init").css("visibility", "hidden");
			if ($("li").first().attr("id") == "me") {
				$("li").first().remove();
			}
		}
		else {
			$(".cost-share").show();
			$(".hide-init").css("visibility", "visible");
			if (!$("li").first().attr("id") != "me") {
				$("#selected-friends").prepend("<li id='me' class = 'added-friend'> <div class='label-name'>Me</div> <input type='text' class='cost-share form-control'></li><div id='center'></div>");
			}
		}
	}
});

Template.create.helpers({
	'selectedFriends': function() {
		return Session.get("selectedFriends");
	},
	'isChecked': function() {
		return $(".cost-checkbox").prop("checked");
	}
});


Template.purchaseProposal.helpers({
	'getPurchaseRoute': function() {
		return "/purchase/" + this._id;
	}
});


Template.ShowPurchase.onRendered(function(){
    Session.set('currentPurchaseID', this._id);
});

Template.ShowPurchase.helpers({
    'populateMessages': function(){
    	/* Sometimes the template renders before SOMETHING shows up (not sure if it's
    	 * the database query or template context), so you need to check that purchase
    	 * exists first, otherwise there's the occasional frontend exception.
    	 */
    	var purchase = Purchases.findOne(this._id);
    	if (purchase) {
    		return purchase.messages;
    	}
    },
    'replying': function(){
     	return Session.get('reply') == this.id;
    },
    'comments': function(){
    	return this.comments;
    }
});

Template.ShowPurchase.events({
    /* Message creation via form submission */
    'submit .new-message': function(event) {
        event.preventDefault();

        /* Message initialization; we should probably
         * transplant this to a constructor to models.js */
        var message = {};
        message.message = event.target.message.value;
        message.creator = Meteor.user().services.venmo.display_name;
        message.created_at = new Date();
        message.id = Purchases.findOne(this._id).messages.length;
        message.comments= [];

        Purchases.update(this._id, {$push: {messages: message}});
        event.target.message.value = "";
    },
    'click .reply-button': function(event){
    	event.preventDefault();

    	Session.set('reply', this.id);
    	$("input#reply").focus();
    },
    'submit .new-reply': function(event){
    	event.preventDefault();

    	var purch_id = Template.instance().data._id;

    	var messages = Purchases.findOne(purch_id).messages;
    	var message = messages[this.id];

    	/* Reply initialization */
    	var reply = {};
    	reply.message = event.target.reply.value;
    	reply.creator = Meteor.user().services.venmo.display_name;
    	reply.created_at = new Date();
    	reply.id = message.comments.length;

    	message.comments.push(reply);
    	Purchases.update(purch_id, {$set: {messages: messages}});

    	event.target.reply.value = "";
    	Session.set('reply', undefined);
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
};


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
