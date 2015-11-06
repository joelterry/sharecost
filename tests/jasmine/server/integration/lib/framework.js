test_login = function(){};
test_logout = function(){};

(function() {
	var fred = {
		_id: "GgofSfjTRtrrpGFLC",
		purchases: {created: [], invited: []},
		services: {venmo: {
			id: "1207374792420528723",
			display_name: "Fred Smith"
		}}
	};
	var sally = {
		_id: "8FYuoa3LCoW4TgTya",
		purchases: {created: [], invited: []},
		services: {venmo: {
			id: "1314932160605184178",
			display_name: "Sally Jackson"

		}}
	};
	var joaquim = {
		_id: "YZMcQsHRXqzfHZbZ2",
		purchases: {created: [], invited: []} ,
		services: {venmo: {
			id: "1491288003016804271",
			display_name: "Joaquim Mahajan"
		}}
	};
	/* This one has no friends */
	var weird = {
		_id: "ZYNdQqHRXpofHZcZ5",
		purchases: {created: [], invited: []},
		services: {venmo: {
			id: "1942328400056804271",
			display_name: "Weird Loner" 
		}}
	}

	Meteor.users.remove({});
	Meteor.users.insert(fred);
	Meteor.users.insert(sally);
	Meteor.users.insert(joaquim);

	Friends.remove({});
	Friends.insert({_id: fred._id, venmo_friends: [sally.services.venmo, joaquim.services.venmo]});
	Friends.insert({_id: sally._id, venmo_friends: [fred.services.venmo, joaquim.services.venmo]});
	Friends.insert({_id: joaquim._id, venmo_friends: [fred.services.venmo, sally.services.venmo]});
	Friends.insert({_id: weird._id, venmo_friends: []});

	test_login = function(name) {
		var user;
		if (name == "fred") {
			user = fred;
		} else if (name == "sally") {
			user = sally;
		} else if (name == "joaquim") {
			user = joaquim;
		}
		spyOn(Meteor, "user").and.returnValue(user);
		spyOn(Meteor, "userId").and.returnValue(user._id);
	}

	test_logout = function() {
		spyOn(Meteor, "user").and.returnValue(null);
		spyOn(Meteor, "userId").and.returnValue(null);
	}

})();
