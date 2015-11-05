// Doesn't really test anything, I was just practicing the syntax
"use strict";
describe("Purchase test", function () {
  var myDatabase = Purchases;
  afterAll(function () {
    myDatabase.remove({"_id": "1"});
  });

  it("check data constraints, no error", function () {
    var entry = {"_id": "1", "title": "Gucci", "description": "Go Bears", "creator": 42, "members": [32], "accepted": [], "rejected": [], "member_names": {32: "Joe"}, "paid": [], "cost": 24, "created_at": 10024};
    if (Meteor.call("check_purchase", entry) == null) {
      myDatabase.insert(entry);
      var purchase = myDatabase.find({"_id" : "1"}).collection._docs._map["1"];
      expect(purchase.title).toBe("Gucci");
      expect(purchase.title.length).toBeLessThan(64);
    }
    expect(Meteor.call("check_purchase", entry)).toBeUndefined();
  });

  it("check data constraints, title too short", function () {
    var entry = {"_id": "1", "title": "", "description": "Go Bears", "creator": 42, "members": [32], "accepted": [], "rejected": [], "member_names": {32: "Joe"}, "paid": [], "cost": 24, "created_at": 10024};
    expect(Meteor.call("check_purchase", entry)).not.toBeNull();
  });
});
