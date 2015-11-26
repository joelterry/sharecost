var user1 = new TestUser('clientasdf', 'user1', 'client1', 'easldk.com');

describe("Click create tests", function() {

    beforeEach(function(done) {
        login(user1);
        Router.go("/");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it("start from homepage", function() {
        expect(Router.current().route.path()).toEqual("/");
    });

    describe("nested", function() {
        beforeEach(function(done) {
            $("#create").trigger("click");
            Tracker.afterFlush(done);
        });

        beforeEach(waitForRouter);

        it("click create", function() {
            expect(Router.current().route.path()).toEqual("/create");
<<<<<<< HEAD
<<<<<<< HEAD
        }, 500);
        $(".cancel").trigger("click");
        setTimeout(function(done) {
            expect(Router.current().route.path()).toEqual("/");
            done();
        }, 500);
=======
=======
>>>>>>> e3858da5f5efac10ae9c9692517d54aa8b6d7a9b
        });

        describe("click cancel", function() {
            beforeEach(function(done) {
                $(".cancel").trigger("click");
                Tracker.afterFlush(done);
            });

            it("click cancel", function() {
                expect(Router.current().route.path()).toEqual("/");
            });
        });
<<<<<<< HEAD
>>>>>>> 7834bda7507767a6b3d587145eab61eb6992aed7
=======
>>>>>>> e3858da5f5efac10ae9c9692517d54aa8b6d7a9b
    });

});

describe("Test logout navigation", function() {

    beforeEach(function(done) {
        login(user1);
        Router.go("/");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    it("start from homepage", function() {
        expect(Router.current().route.path()).toEqual("/");
    });

});

describe("Logout test", function() {
    beforeEach(function(done) {
        $("#logout").trigger("click");
<<<<<<< HEAD
<<<<<<< HEAD
        setTimeout(function(done) {
            expect(Router.current().route.path()).toEqual("/login");
            done();
        }, 500);
=======
=======
>>>>>>> e3858da5f5efac10ae9c9692517d54aa8b6d7a9b
        spyOn(Meteor, "user").and.returnValue(null);
        spyOn(Meteor, "userId").and.returnValue(null);
        Router.go("/");
        Tracker.afterFlush(done);
    });

    beforeEach(waitForRouter);

    describe("nested", function() {
        beforeEach(function(done) {
            Router.go("/login");
            Tracker.afterFlush(done);
        });
        beforeEach(waitForRouter);

        it("click logout", function() {
            expect(Router.current().route.path()).toEqual("/login");
        });
<<<<<<< HEAD
>>>>>>> 7834bda7507767a6b3d587145eab61eb6992aed7
=======
>>>>>>> e3858da5f5efac10ae9c9692517d54aa8b6d7a9b
    });
});
