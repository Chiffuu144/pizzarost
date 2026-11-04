const mongoose = require('mongoose');
const dns = require('dns');

const connectDatabase = async () => {
    const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
        ?.split(',')
        .map(server => server.trim())
        .filter(Boolean);

    if (configuredDnsServers?.length) {
        dns.setServers(configuredDnsServers);
    } else if (dns.getServers().some(server => server === '127.0.0.1' || server === '::1')) {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
    }

    const con = await mongoose.connect(process.env.DB_URI);
    console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    return con;
}

module.exports = connectDatabase