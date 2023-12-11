const router = require("express").Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { key, keyPub } = require("../../keys");

const connection = require("../../database");

router.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  const verifyMailSql = "SELECT * FROM users WHERE email = ?"; // vérification de l'existence du mail
  connection.query(verifyMailSql, [email], async (err, result) => {
    try {
      if (result.length === 0) {
        // si il n'existe pas on hashe le mdp et on insère en BDD
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertSql =
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        connection.query(
          insertSql,
          [name, email, hashedPassword],
          (err, result) => {
            if (err) throw err;
            let idUser = result.insertId; // On récupére l'id de la dernière insertion
            const sqlSelect =
              "SELECT idusers, name, email FROM users WHERE idUser = ?";
            connection.query(sqlSelect, [idUser], (err, result) => {
              // On récupère les données correspondant à cet id -> front
              if (err) throw err;
              res.json(result);
            });
          }
        );
      } else {
        // si le mail existe
        res.status(400).json("Le mail existe");
      }
    } catch (error) {
      console.log(error);
    }
  });
});

router.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const sqlVerify = "SELECT * FROM users WHERE email= ?";
  connection.query(sqlVerify, [email], (err, result) => {
    try {
      if (result.length > 0) {
        if (bcrypt.compareSync(password, result[0].password)) {
          const token = jsonwebtoken.sign({}, key, {
            subject: result[0].idusers.toString(),
            expiresIn: 3600 * 24 * 30,
            algorithm: "RS256",
          });
          res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          res.json(result[0]);
        } else {
          res.status(400).json("Email et/ou mot de passe incorrects");
        }
      } else {
        res.status(400).json("Email et/ou mot de passe incorrects");
      }
    } catch (error) {
      console.log(error);
    }
  });
});

router.get("/userConnected", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decodedToken = jsonwebtoken.verify(token, keyPub, {
        algorithms: "RS256",
      });
      const sqlSelect =
        "SELECT idUsers, name, email FROM users WHERE idUser  =?";
      connection.query(sqlSelect, [decodedToken.sub], (err, result) => {
        if (err) throw err;
        const connectedUser = result[0];
        connectedUser.password = "";
        if (connectedUser) {
          console.log(connectedUser);
          res.json(connectedUser);
        } else {
          res.json(null);
        }
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json(null);
  }
});

router.delete("/logout", (req, res) => {
  res.clearCookie("token");
  res.end();
});

router.get("/getUsers", (req,res) => {
  connection.query("SELECT * FROM users", (err, data) => {
    if (err) throw err;
    res.status(200).json({data})
  })
})

module.exports = router;
