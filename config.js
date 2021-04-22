var crypto=require('crypto');
const ivp=crypto.randomBytes(16);

module.exports = {
    'iv' :  ivp
}
