const mysql = require("mysql2");
require("dotenv").config();

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "jwt",
// });

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
})

connection.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

module.exports = connection;
