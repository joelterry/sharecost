"use strict";
describe("Purchase test", function () {
  it("check data constraints", function () {
    //Purchases.insert({"id": 1, "title": "Gucci", "description": "Go Bears", "creator": 42, "members": [{"venmo_id": 42, "vote_status": 0}, {"venmo_id": 34, "vote_status": 1}], "cost": 24, "created_at": 10024});
    
    var purchase = Purchases.find({"id" : 1})["collection"]["_docs"]["_map"]["ge3tGQZ97TFpy9XX9"] //hacky

    expect(purchase["title"]).toBe("Gucci");
    expect(purchase["title"].length).toBeLessThan(64);
  });
});
