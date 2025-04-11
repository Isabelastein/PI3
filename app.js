const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session"); // Adicionando express-session

const app = express();
const port = 3000;

// Configuração do banco de dados
const pool = new Pool({
  user: "postgres", 
  host: "localhost",
  database: "PI3",
  password: "isa", 
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key', // Troque por uma chave segura
  resave: false,
  saveUninitialized: true,
}));

// Servir arquivos estáticos (index.html, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a raiz (adicionada)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para verificar se o usuário está logado
app.get("/isLoggedIn", (req, res) => {
  if (req.session.userId) {
    return res.json({ loggedIn: true });
  }
  res.json({ loggedIn: false });
});

// Cadastro
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Verificar se o e-mail já existe
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "E-mail já registrado." });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir no banco
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuário criado com sucesso!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    req.session.userId = user.rows[0].id; // Guardando a sessão
    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
