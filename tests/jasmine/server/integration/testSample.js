describe("integration test", function() {
    testUser = class {
        constructor(name, venmo_id, profile_picture) {
            this.services = {};
            this.services.venmo = {};
            this.services.venmo.display_name = name;
            this.services.venmo.id = venmo_id;
            this.services.venmo.accessToken = "32ad442";
            this.services.venmo.profile_picture_url = profile_picture;
        }
    }

    var user1 = new testUser('user1', '1', 'http://www.mysticpizza.com/admin/resources/pizza-pepperoni-w857h456.jpg');
    var user2 = new testUser('user2', '2', 'http://5tim.com/wp-content/uploads/2011/05/hamburger.jpg');
    var user3 = new testUser('user3', '3', 'https://www.berksfoods.com/wp-content/uploads/2014/02/ph_home_1.png');

    beforeEach(function() {
        friendsDatabase = jasmine.createSpy().and.callFake(function() {
            return new Mongo.Collection('friendTest');
        });
        purchasesDatabase = jasmine.createSpy().and.callFake(function() {
            return new Mongo.Collection('purchaseTest');
        });
        meteorUsers = jasmine.createSpy().and.callFake(function() {
            return new Mongo.Collection('userTest');
        });
        spyOn(Meteor, 'userId').and.callFake(function() {
            return Users.find(user1)._id;
        });
        spyOn(Meteor, 'user').and.callFake(function() {
            return user1;
        });
        get_friends = jasmine.createSpy().and.callFake(function() {
            return [user2.services.venmo, user3.services.venmo];
        });
        pay = jasmine.createSpy().and.callFake(function() {
            var response = {};
            response.data = {};
            response.data.data = {};
            response.data.data.payment = {};
            response.data.data.payment.status = 'settled';
            return response;
        });
    });

    afterEach(function() {
        Friends.remove({});
        Purchases.remove({});
    });

    it("verify friends initialization", function() {
        Meteor.call('after_login');
        setTimeout(function() {
            expect(Friends.find(Meteor.userId())).venmo_friends.length.toBe(2);
        }, 500);
    });
});
