const qr = require('qrcode');
const { url } = require('../config');

function genQr(str) {
  qr.toFile('qr.png', str);
}

function makeId(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  genQr(`${url}/m/${result}`);
  return result;
}

module.exports = { makeId, genQr };
