var assert = require('assert')
  , config = require('../../config')
  , fixtures = require('../fixtures')
  , models = require('../../models')
  , services = require("../../services");

describe('principals service', function() {
    var passwordFixture = "sEcReT44";

    it('can create and validate a user', function(done) {
        var user = new models.Principal({ type: "user",
                                          email: "user@gmail.com",
                                          password: passwordFixture });

        services.principals.create(user, function(err, user) {
            assert.ifError(err);
            assert.notEqual(user.id, undefined);
            assert.notEqual(user.password_hash, undefined);
            assert.notEqual(user.password_hash, passwordFixture);
            assert.equal(user.email, "user@gmail.com");

            services.principals.verifyPassword(passwordFixture, user, function(err) {
                assert.ifError(err);
                 services.principals.verifyPassword("NOTCORRECT", user, function(err) {
                     assert.notEqual(err, null);
                     done();
                });
            });
        });
    });

    it('can create and validate a device', function(done) {
        var device = new models.Principal({ type: "device" });
        services.principals.create(device, function(err, device) {
            assert.ifError(err);
            assert.notEqual(device.id, undefined);
            assert.notEqual(device.secret_hash, undefined);

            services.principals.verifySecret(device.secret, device, function(err) {
                assert.ifError(err);
                services.principals.verifySecret("NOTCORRECT", device, function(err) {
                    assert.notEqual(err, null);
                    done();
                });
            });
        });
    });

    it('can authenticate a device', function(done) {

        var request = { id: fixtures.models.principals.device.id,
                        secret: fixtures.models.principals.device.secret };

        services.principals.authenticate(request, function(err, principal, accessToken) {
            assert.ifError(err);
            assert.notEqual(principal, undefined);
            assert.notEqual(accessToken, undefined);

            done();
        });
    });

    it('system can update a principal', function(done) {
        fixtures.models.principals.device.name = 'my camera';
        services.principals.update(services.principals.systemPrincipal, fixtures.models.principals.device.id, { name: "my camera"}, function(err, principal) {
            assert.ifError(err);
            assert.equal(principal.name, 'my camera');

            done();
        });
    });

    it('system principals can update a principals name', function(done) {
        services.principals.update(fixtures.models.principals.device, fixtures.models.principals.device.id, { name: "my camera" }, function(err, principal) {
            assert.ifError(err);
            assert.equal(principal.name, 'my camera');
            done();
        });
    });

    it('should reject creating a user without an email', function(done) {
        var user = new models.Principal({ type: 'user',
            password: fixtures.models.principals.user.password });

        services.principals.create(user, function(err, user) {
            assert.equal(!!err, true);
            done();
        });
    });

    it('should reject creating a user without a password', function(done) {
        var user = new models.Principal({ type: 'user',
                                          email: 'newuser@gmail.com' });

        services.principals.create(user, function(err, user) {
            assert.equal(!!err, true);
            done();
        });
    });

    it('should reject creating a if user that already exists', function(done) {
        var user = new models.Principal({ type: 'user',
                                          email: fixtures.models.principals.user.email,
                                          password: fixtures.models.principals.user.password });

        services.principals.create(user, function(err, user) {
            assert.equal(!err, false);
            done();
        });
    });

});