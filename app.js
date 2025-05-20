const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 3000;

// Configuração do PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "PI3",
  password: "isa",
  port: 5432,
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 dia
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get("/app", (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Verifica sessão
app.get("/isLoggedIn", (req, res) => {
  res.json({ loggedIn: !!req.session.userId });
});

// Cadastro
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const emailCheck = await pool.query("SELECT * FROM pi3 WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "E-mail já registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO pi3 (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    req.session.userId = newUser.rows[0].id;
    res.status(201).json({
      message: "Cadastro realizado com sucesso!",
      user: newUser.rows[0],
      redirect: '/app'
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ message: "Erro no servidor durante o cadastro." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM pi3 WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    req.session.userId = user.rows[0].id;
    res.status(200).json({
      message: "Login realizado com sucesso!",
      redirect: '/app'
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor durante o login." });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao destruir sessão:", err);
      return res.status(500).json({ message: "Erro ao sair." });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logout efetuado.", redirect: '/' });
  });
});

// Dados do usuário logado
app.get("/user", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    const user = await pool.query(
      "SELECT id, name, email FROM pi3 WHERE id = $1", 
      [req.session.userId]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Banco de dados: ${pool.options.database}@${pool.options.host}`);
});