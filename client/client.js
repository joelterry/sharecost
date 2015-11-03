/* General client code */

Template.login.events({
  'click #venmo-login': function(event) {
      Meteor.loginWithVenmo(function (err, res) {
        if (err){
        	console.log(err);
          throw new Meteor.Error("Login failed"); 
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
    'getProfilePictureUrl': function() {
        var user = Meteor.user();
        return user.services.venmo.profile_picture_url
    },
    'purchases': function(){
        return Purchases.find({});
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
				Purchases.insert(purch);
				// Router.go('/')
				tempPurch = Purchases.findOne({title: purch.title});
				Router.go('purchase.show', {_id: tempPurch._id});
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
	'creatorName': function() {
		var purch = Template.instance().data;
		return purch.member_names[purch.creator];
	},
	/* Returns true if the creator of this purchase is logged in. */
	'isCreator': function() {
		var purch = Template.instance().data;
		return purch.creator == Meteor.user().services.venmo.id;
	},
	'accepted': function() {
		var purch = Template.instance().data;
		return purch.accepted.map(function(elem){
			return purch.member_names[elem];
		});
	},
	'rejected': function() {
		var purch = Template.instance().data;
		return purch.rejected.map(function(elem){
			return purch.member_names[elem];
		});
	},
	'pending': function() {
		var purch = Template.instance().data;
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
	},
	'getPurchaseRoute': function() {
		return "/purchase/" + this._id;
	}
});

Template.purchaseProposal.events({
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
});

Template.ShowPurchase.onRendered(function(){
	Session.set('currentPurchaseID', this._id);
	console.log(Template.instance().data._id);
});

Template.ShowPurchase.helpers({
	'populateMessages': function(){
		return Messages.find(Session.get('currentPurchaseID'));
	},
	'returnID': function(){
		return Template.instance().data._id;
	}
});

Template.ShowPurchase.events({
	/* Message creation via form submission */
	'submit #messageSubmit': function(event) {
		event.preventDefault();

		var message = {};
		message.purchase_id = Session.get('currentPurchaseID');
		message.title = event.target.messageTitle.value;
		message.message = event.target.message.value;
		message.creator = Meteor.user().services.venmo.id;
		message.created_at = new Date();

		Messages.insert(message);
	}
});

var events = {
  'click #logout': function(event) {
    Meteor.logout(function(err){
        if (err) {
            throw new Meteor.Error("Logout failed");
        }
        Router.go('/');
    });
  }
}

Template.BaseLayout.events(events);
Template.home.events(events);
Template.create.events(events);

Template.registerHelper('getProfilePictureUrl', function() {
    var user = Meteor.user();
    return user.services.venmo.profile_picture_url
});

