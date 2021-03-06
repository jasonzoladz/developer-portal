'use strict';

const Promise = require('bluebird');

class Identity {
  constructor(jwt, err) {
    this.jwt = jwt;
    this.err = err;
  }

  checkPayload(payload, key) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) {
      throw this.err.unauthorized(`Your token does not contain payload.${key}`);
    }
  }

  getUser(token) {
    const tokenData = this.jwt.decode(token);
    this.checkPayload(tokenData, 'sub');
    this.checkPayload(tokenData, 'name');
    if (!Object.prototype.hasOwnProperty.call(tokenData, 'email')) {
      tokenData.email = tokenData['cognito:username'];
    }
    return new Promise((res) => {
      res({
        email: tokenData.email,
        name: tokenData.name,
        vendors: Object.prototype.hasOwnProperty.call(tokenData, 'profile')
          ? tokenData.profile.split(',') : [],
        isAdmin: Object.prototype.hasOwnProperty.call(tokenData, 'custom:isAdmin')
          ? parseInt(tokenData['custom:isAdmin'], 10) === 1 : false,
      });
    });
  }

  getAdmin(token) {
    return this.getUser(token)
      .then((user) => {
        if (!user.isAdmin) {
          throw this.err.forbidden();
        }
        return user;
      });
  }

  static formatUser(data) {
    const attrs = {};
    data.UserAttributes.map((obj) => {
      attrs[obj.Name] = obj.Value;
      return obj;
    });
    return new Promise((res) => {
      res({
        email: data.Username,
        name: attrs.name,
        phone: Object.prototype.hasOwnProperty.call(attrs, 'phone_number') ? attrs.phone_number : null,
        vendors: attrs.profile ? attrs.profile.split(',') : [],
        isAdmin: Object.prototype.hasOwnProperty.call(attrs, 'custom:isAdmin') && attrs['custom:isAdmin'] === '1',
        isEnabled: data.Enabled,
      });
    });
  }

  checkVendorPermissions(user, vendor) {
    if (user.vendors.indexOf(vendor) === -1 && !user.isAdmin) {
      throw this.err.unauthorized(`You do not have permissions to use vendor ${vendor}`);
    }
    return new Promise(res => res());
  }
}

export default Identity;
