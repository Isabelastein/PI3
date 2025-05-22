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
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verificação inicial da conexão (opcional)
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexão com o banco estabelecida'))
  .catch(err => console.error('❌ Falha na conexão:', err));

// ==================== CRIAÇÃO DA TABELA DE SESSÕES ====================
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessoes_usuarios (
        "sid" varchar NOT NULL PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp NOT NULL
      );
    `);
    console.log('✔ Tabela de sessões verificada/criada');
  } catch (err) {
    console.error('Erro ao criar tabela de sessões:', err);
  }
})();

// ==================== MIDDLEWARES ====================
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
    createTableIfMissing: false
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// ==================== ROTAS ESTÁTICAS ====================
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

// ==================== ROTAS DA API ====================
app.get("/isLoggedIn", (req, res) => {
  res.json({ loggedIn: !!req.session.userId });
});

app.post("/signup", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const verificaEmail = await pool.query(
      "SELECT * FROM pi3 WHERE email = $1", 
      [email]
    );
    
    if (verificaEmail.rows.length > 0) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = await pool.query(
      `INSERT INTO pi3 (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
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
    const usuario = await pool.query(
      "SELECT * FROM pi3 WHERE email = $1", 
      [email]
    );
    
    if (usuario.rows.length === 0) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].password_hash);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: "Credenciais inválidas." });
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
      return res.status(500).json({ mensagem: "Erro ao sair." });
    }
    res.clearCookie('connect.sid');
    res.json({ mensagem: "Sessão encerrada.", redirect: '/' });
  });
});

app.get("/user", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ mensagem: "Não autorizado" });
  }

  try {
    const usuario = await pool.query(
      "SELECT id, name, email FROM pi3 WHERE id = $1", 
      [req.session.userId]
    );
    res.json(usuario.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

// ==================== MIDDLEWARE DE ERRO ====================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ 
    mensagem: "Ocorreu um erro inesperado",
    ...(process.env.NODE_ENV !== 'production' && { detalhes: err.message })
  });
});

// ==================== INICIALIZAÇÃO ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Servidor rodando na porta ${PORT}
  🔧 Modo: ${process.env.NODE_ENV || 'desenvolvimento'}
  🗄️ Banco: ${process.env.DATABASE_URL ? 'Railway' : 'Local'}
  🔒 Sessões: ${process.env.SESSION_SECRET ? 'Protegidas' : 'Modo desenvolvimento'}
  ==========================================
  `);
});