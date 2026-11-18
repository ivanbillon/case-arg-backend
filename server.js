const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configuración de CORS optimizada para tu plataforma web en línea y local
app.use(cors({
    origin: '*', // Permite solicitudes desde cualquier cliente (frontend, móvil, web)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Conexión segura a tu MongoDB Atlas
const MONGO_URI = 'mongodb+srv://ivanbillon40_db_user:Ey5UsBUI3GLC9UCz@cluster0.rzpeyql.mongodb.net/case_arg_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Base de datos segura conectada'))
.catch(err => console.error('Error de conexión:', err));

// Esquema de Usuario blindado
const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalBalance: { type: Number, default: 23459.62 },
    retirableBalance: { type: Number, default: 19600.00 },
    role: { type: String, default: 'client' }, // 'client' o 'admin'
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Ruta de prueba para verificar estado de la API en Render
app.get('/api', (req, res) => {
    res.json({ success: true, message: 'API de CASE ARG funcionando correctamente en Render' });
});

// 1. RUTA DE REGISTRO BLINDADA
app.post('/api/register', async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Datos inválidos o contraseña muy corta.' });
        }

        const existing = await User.findOne({ phone });
        if (existing) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
        }

        const newUser = new User({ phone, password });
        await newUser.save();
        res.json({ success: true, message: 'Usuario registrado de forma segura.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. RUTA DE LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }
        res.json({ 
            success: true, 
            user: { 
                phone: user.phone, 
                totalBalance: user.totalBalance, 
                retirableBalance: user.retirableBalance,
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. RUTA ADMIN: OBTENER TODOS LOS USUARIOS (Protegida)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor blindado corriendo en puerto ${PORT}`));
