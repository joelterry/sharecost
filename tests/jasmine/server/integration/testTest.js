"use strict";
describe("framework test", function(){

	it("login test", function() {
		test_login("fred");
		expect(Meteor.user().services.venmo.display_name).toEqual("Fred Smith");
	});
});