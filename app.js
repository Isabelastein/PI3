require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);

const app = express();

// ==================== CONFIGURAÇÃO DO BANCO ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:isa@localhost:5432/PI3",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ==================== MIDDLEWARES ====================
// Novo: Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CONFIGURAÇÃO DE SESSÃO ====================
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'sessoes_usuarios',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'segredo-temporario-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// ==================== ROTAS ====================
// Rotas de arquivos HTML
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

// Rotas da API
app.get("/isLoggedIn", (req, res) => {
  res.json({ loggedIn: !!req.session.userId });
});

app.post("/signup", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const verificaEmail = await pool.query("SELECT * FROM pi3 WHERE email = $1", [email]);
    if (verificaEmail.rows.length > 0) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = await pool.query(
      "INSERT INTO pi3 (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome, email, senhaCriptografada]
    );

    req.session.userId = novoUsuario.rows[0].id;
    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      usuario: novoUsuario.rows[0],
      redirect: '/app'
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ mensagem: "Erro interno durante o cadastro." });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await pool.query("SELECT * FROM pi3 WHERE email = $1", [email]);
    if (usuario.rows.length === 0) {
      return res.status(400).json({ mensagem: "E-mail ou senha incorretos." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha_hash);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: "E-mail ou senha incorretos." });
    }

    req.session.userId = usuario.rows[0].id;
    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      redirect: '/app'
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ mensagem: "Erro interno durante o login." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao encerrar sessão:", err);
      return res.status(500).json({ mensagem: "Erro ao sair." });
    }
    res.clearCookie('connect.sid');
    res.json({ mensagem: "Sessão encerrada com sucesso.", redirect: '/' });
  });
});

app.get("/user", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ mensagem: "Acesso não autorizado" });
  }

  try {
    const usuario = await pool.query(
      "SELECT id, nome, email FROM pi3 WHERE id = $1", 
      [req.session.userId]
    );
    res.json(usuario.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
});

// ==================== NOVO: MIDDLEWARE DE ERRO ====================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ 
    mensagem: "Ocorreu um erro inesperado",
    ...(process.env.NODE_ENV === 'development' && { detalhes: err.message })
  });
});

// ==================== INICIALIZAÇÃO ====================
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`
  ==========================================
  🚀 Servidor rodando na porta ${PORTA}
  🔧 Modo: ${process.env.NODE_ENV || 'desenvolvimento'}
  🗄️ Banco: ${process.env.DATABASE_URL ? 'Railway' : 'Local'}
  🔒 Sessões: ${process.env.SESSION_SECRET ? 'Protegidas' : 'Modo desenvolvimento'}
  ==========================================
  `);
});