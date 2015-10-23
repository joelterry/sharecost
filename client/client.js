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

Template.create.events({
    
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
	'submit': function(event) {
		event.preventDefault();

		var purch = {};
		purch.title = event.target.title.value;
		purch.description = event.target.description.value;
		purch.cost = Number(event.target.cost.value);
		purch.creator = Meteor.userId();
		purch.members = Session.get("selectedFriends")
			.map(function(elem){return {venmo_id: elem.id, vote_status: 0}});
		purch.created_at = new Date();

		Meteor.call("check_purchase", purch, function(err, res) {
			if (res.length > 0) {
				alert("ERROR:\n" + res.join("\n"));
			} else {
				Purchases.insert(purch);
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

Template.purchase_proposal.events({
	'yesVote': function() {
		console.log(this);
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

