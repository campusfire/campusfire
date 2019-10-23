const os = require('os');

const ifaces = os.networkInterfaces();

let ip = '';
Object.keys(ifaces).forEach((ifname) => {
  ifaces[ifname].forEach((iface) => {
    if (iface.family !== 'IPv4' || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    ip = iface.address;
  });
});
console.log(ip);
const port = process.env.ENV !== 'PROD' ? ':3000' : '';
const url = `http://${ip}${port}`;

exports.url = url;
