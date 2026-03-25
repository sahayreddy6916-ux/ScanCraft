import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const PORT = 3000;

// Database Setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user', // 'user', 'admin', 'super-user'
  }
});

const Log = sequelize.define('Log', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
  }
});

const AppMode = sequelize.define('AppMode', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

const GeneratedCode = sequelize.define('GeneratedCode', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // 'barcode' or 'qr'
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING, // 'CODE128', 'EAN13', 'UPC', 'QR'
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.TEXT, // JSON string of options (width, height, etc.)
    allowNull: true,
  }
});

User.hasMany(GeneratedCode, { foreignKey: 'userId' });
GeneratedCode.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Log, { foreignKey: 'userId' });
Log.belongsTo(User, { foreignKey: 'userId' });

async function logActivity(userId: number, action: string, details: string = '') {
  try {
    await Log.create({ userId, action, details });
  } catch (e) {
    console.error('Logging failed:', e);
  }
}

async function startServer() {
  await sequelize.sync();
  console.log('Database synced');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const authorizeRoles = (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
      next();
    };
  };

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user: any = await User.create({ email, password: hashedPassword, role: role || 'user' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      await logActivity(user.id, 'SIGNUP', `User signed up as ${user.role}`);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      await logActivity(user.id, 'LOGIN', 'User logged in');
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Code Routes
  app.get('/api/codes', authenticateToken, async (req: any, res) => {
    try {
      const codes = await GeneratedCode.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/codes', authenticateToken, async (req: any, res) => {
    try {
      const { type, format, value, options } = req.body;
      const code = await GeneratedCode.create({
        userId: req.user.id,
        type,
        format,
        value,
        options: JSON.stringify(options)
      });
      await logActivity(req.user.id, 'GENERATE_CODE', `Generated ${type} (${format})`);
      res.json(code);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/codes/:id', authenticateToken, async (req: any, res) => {
    try {
      await GeneratedCode.destroy({ where: { id: req.params.id, userId: req.user.id } });
      await logActivity(req.user.id, 'DELETE_CODE', `Deleted code ${req.params.id}`);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Routes
  app.get('/api/admin/logs', authenticateToken, authorizeRoles('admin', 'super-user'), async (req, res) => {
    try {
      const logs = await Log.findAll({
        include: [{ model: User, attributes: ['email'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/modes', authenticateToken, async (req, res) => {
    try {
      const modes = await AppMode.findAll({ where: { isActive: true } });
      res.json(modes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/modes', authenticateToken, authorizeRoles('admin', 'super-user'), async (req: any, res) => {
    try {
      const { name, description } = req.body;
      const mode = await AppMode.create({ name, description });
      await logActivity(req.user.id, 'CREATE_MODE', `Created new mode: ${name}`);
      res.json(mode);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/modes/:id', authenticateToken, authorizeRoles('admin', 'super-user'), async (req: any, res) => {
    try {
      await AppMode.destroy({ where: { id: req.params.id } });
      await logActivity(req.user.id, 'DELETE_MODE', `Deleted mode ${req.params.id}`);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
