const os = require('os');

let url = '';
if (process.env.ENV !== 'PROD') {
  let ip = '';
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      ip = iface.address;
    });
  });
  url = `http://${ip}:3000`;
} else url = `http://node.${process.env.PORT.toLowerCase()}.ovh1.ec-m.fr/d/fire`;
console.log(url);

exports.url = url;
