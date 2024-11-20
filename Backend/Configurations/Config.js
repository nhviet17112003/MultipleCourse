require("dotenv").config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  secretKey: process.env.SECRET_KEY,
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
};
