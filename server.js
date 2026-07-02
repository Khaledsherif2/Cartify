require('dotenv').config();
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = require('./app');
const connectToDB = require('./config/databas');

connectToDB();

const port = process.env.PORT || 8080;

app.listen(port, _ => {
  console.log(`🚀 ~ app runinning on port: ${port}`);
});
