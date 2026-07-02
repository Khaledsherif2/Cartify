const mongoose = require('mongoose');

const uri = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

const connectToDB = async _ => {
  await mongoose.connect(uri);
  console.log('🚀 ~ connected to DB successfully');
};

module.exports = connectToDB;
