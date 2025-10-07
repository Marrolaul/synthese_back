import { after, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import User from "../models/User.js";
let testUser = resetTestUser();
const validTestUser = new User({
    id: "68472b6acc6067796d36c96c",
    firstName: "Julie",
    lastName: "Provencher",
    email: "julie@email.ca",
    password: "123456",
    role: "customer",
    phoneNumber: "(819)-535-0048"
});
function resetTestUser() {
    return new User({});
}
const invalidIdMinusOne = "68472b6acc6067796d36c96";
const invalidIdPlusOne = "68472b6acc6067796d36c96c1";
const invalidEmailWithoutA = "julieemail.ca";
const invalidEmailWithoutADot = "julie@emailca";
const invalidEmailWithoutACharAfterDot = "julie@emailca.";
const invalidPhoneNumberNoParenthese = "819-535-0048";
const invalidPhoneNumberNoDash = "(819)5350048";
const invalidPhoneNumberLetterIn = "(819)-5E5-0048";
const invalidPhoneNumberMissingNumber = "(89)-535-0048";
describe("Tests creating new User", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("testUser.role equals 'customer' if none is entered", () => {
        assert.strictEqual(testUser.role, "customer");
    });
});
describe("Tests of isValidIdOrNotInDb", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("Return true if id is undefined.", () => {
        assert.strictEqual(testUser.isValidIdOrNotInDb(), true);
    });
    it("Return true if id.length equals 24.", () => {
        testUser.id = validTestUser.id;
        assert.strictEqual(testUser.isValidIdOrNotInDb(), true);
    });
    it("Return false if id == ''.", () => {
        testUser.id = "";
        assert.strictEqual(testUser.isValidIdOrNotInDb(), false);
    });
    it("Return false if id.length equals 23.", () => {
        testUser.id = invalidIdMinusOne;
        assert.strictEqual(testUser.isValidIdOrNotInDb(), false);
    });
    it("Return false if id.length equals 25.", () => {
        testUser.id = invalidIdPlusOne;
        assert.strictEqual(testUser.isValidIdOrNotInDb(), false);
    });
});
describe("Tests of isValidEmail", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("Return false if email is undefined.", () => {
        assert.strictEqual(testUser.isValidEmail(), false);
    });
    it("Return false if email doesn't have an @.", () => {
        testUser.email = invalidEmailWithoutA;
        assert.strictEqual(testUser.isValidEmail(), false);
    });
    it("Return false if email doesn't have an . after the @.", () => {
        testUser.email = invalidEmailWithoutADot;
        assert.strictEqual(testUser.isValidEmail(), false);
    });
    it("Return false if email doesn't have at least 1 character after the ..", () => {
        testUser.email = invalidEmailWithoutACharAfterDot;
        assert.strictEqual(testUser.isValidEmail(), false);
    });
    it("Return true if email is valid.", () => {
        testUser.email = validTestUser.email;
        assert.strictEqual(testUser.isValidEmail(), true);
    });
});
describe("Tests of isValidRole", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("Return false if testUser.role is not is the list of roles", () => {
        testUser = new User({
            role: "poulet"
        });
        assert.strictEqual(testUser.isValidRole(), false);
    });
    it("Return true if testUser.role is 'customer'", () => {
        testUser = new User({
            role: "customer"
        });
        assert.strictEqual(testUser.isValidRole(), true);
    });
    it("Return true if testUser.role is 'employee'", () => {
        testUser = new User({
            role: "employee"
        });
        assert.strictEqual(testUser.isValidRole(), true);
    });
    it("Return true if testUser.role is 'admin'", () => {
        testUser = new User({
            role: "admin"
        });
        assert.strictEqual(testUser.isValidRole(), true);
    });
});
describe("Tests of isValidPhoneNumber", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("Return false if phoneNumber is undefined.", () => {
        assert.strictEqual(testUser.isValidPhoneNumber(), false);
    });
    it("Return false if phoneNumber doesn't have ().", () => {
        testUser.phoneNumber = invalidPhoneNumberNoParenthese;
        assert.strictEqual(testUser.isValidPhoneNumber(), false);
    });
    it("Return false if phoneNumber doesn't have -", () => {
        testUser.phoneNumber = invalidPhoneNumberNoDash;
        assert.strictEqual(testUser.isValidPhoneNumber(), false);
    });
    it("Return false if phoneNumber have a letter in it.", () => {
        testUser.phoneNumber = invalidPhoneNumberLetterIn;
        assert.strictEqual(testUser.isValidPhoneNumber(), false);
    });
    it("Return false if phoneNumber have a number missing.", () => {
        testUser.phoneNumber = invalidPhoneNumberMissingNumber;
        assert.strictEqual(testUser.isValidPhoneNumber(), false);
    });
    it("Return true if phoneNumber is valid.", () => {
        testUser.phoneNumber = validTestUser.phoneNumber;
        assert.strictEqual(testUser.isValidPhoneNumber(), true);
    });
});
describe("Tests of isValidUser", () => {
    beforeEach(() => testUser = resetTestUser());
    after(() => testUser = resetTestUser());
    it("Return 'invalid_id' if id is not valid.", () => {
        testUser.id = invalidIdPlusOne;
        assert.strictEqual(testUser.isValidUser(), "invalid_id");
    });
    it("Return 'invalid_first_name' if firstName is undefined.", () => {
        testUser.id = validTestUser.id;
        assert.strictEqual(testUser.isValidUser(), "invalid_first_name");
    });
    it("Return 'invalid_first_name' if firstName is ''.", () => {
        testUser = new User(validTestUser);
        testUser.firstName = "";
        assert.strictEqual(testUser.isValidUser(), "invalid_first_name");
    });
    it("Return 'invalid_last_name' if lastName is undefined.", () => {
        testUser.id = validTestUser.id;
        testUser.firstName = validTestUser.firstName;
        assert.strictEqual(testUser.isValidUser(), "invalid_last_name");
    });
    it("Return 'invalid_last_name' if lastName is ''.", () => {
        testUser = new User(validTestUser);
        testUser.lastName = "";
        assert.strictEqual(testUser.isValidUser(), "invalid_last_name");
    });
    it("Return 'invalid_email' if email is invalid.", () => {
        testUser = new User(validTestUser);
        testUser.email = invalidEmailWithoutA;
        assert.strictEqual(testUser.isValidUser(), "invalid_email");
    });
    it("Return 'invalid_password' if password is undefined.", () => {
        testUser.id = validTestUser.id;
        testUser.firstName = validTestUser.firstName;
        testUser.lastName = validTestUser.lastName;
        testUser.email = validTestUser.email;
        assert.strictEqual(testUser.isValidUser(), "invalid_password");
    });
    it("Return 'invalid_password' if password is ''.", () => {
        testUser = new User(validTestUser);
        testUser.password = "";
        assert.strictEqual(testUser.isValidUser(), "invalid_password");
    });
    it("Return 'invalid_role' if role is invalid.", () => {
        testUser = new User({
            role: "poulet"
        });
        testUser.id = validTestUser.id;
        testUser.firstName = validTestUser.firstName;
        testUser.lastName = validTestUser.lastName;
        testUser.email = validTestUser.email;
        testUser.password = validTestUser.password;
        assert.strictEqual(testUser.isValidUser(), "invalid_role");
    });
    it("Return 'invalid_phone_number' if phoneNumber is invalid.", () => {
        testUser = new User(validTestUser);
        testUser.phoneNumber = invalidPhoneNumberMissingNumber;
        assert.strictEqual(testUser.isValidUser(), "invalid_phone_number");
    });
    it("Return 'valid_user' if user is valid.", () => {
        testUser = new User(validTestUser);
        assert.strictEqual(testUser.isValidUser(), "valid_user");
    });
});
