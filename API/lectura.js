//lecture.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const session = require('express-session');

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://benjaminmartinez29:Martinez890@User.bhz2ags.mongodb.net/sistema_reserva?retryWrites=true&w=majority';
app.use(session({
    secret: 'tu_secreto', // Cambia esto por una cadena segura
    resave: false,
    saveUninitialized: true,
}));

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Conexión exitosa a MongoDB');
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB: ' + err);
    });

const userSchema = new mongoose.Schema({
    rut: String,
    nombre: String,
    email: String,
    contraseña: String
});
const avionSchema = new mongoose.Schema({
    "image": String,
    "ID Vuelos": String,
    "Nombre vuelo": String,
    "ID Aerolinea": String,
    "Origen": String,
    "Destino": String,
    "Fecha y hora de salida": String,
    "Fecha y hora de llegada": String,
    "Capacidad": String,
    "Precio": String
});

const User = mongoose.model('User', userSchema, 'usuarios');

app.post('/autenticar-usuario', async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const user = await User.findOne({ email, contraseña });

        if (user) {
            // Asociar el "Rut" con la sesión actual
            req.session.usuario_rut = user.rut;

            res.status(200).json({ mensaje: 'Autenticación exitosa', usuario: user });
        } else {
            res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ mensaje: 'Error al autenticar usuario' });
    }
});
const Avion = mongoose.model('Avion', avionSchema, 'Vuelos'); // Cambia 'aviones' por el nombre correcto de tu colección

app.get('/obtener-aviones', async (req, res) => {
    try {
        const aviones = await Avion.find();
        res.status(200).json(aviones);
    } catch (error) {
        console.error('Error al obtener aviones:', error);
        res.status(500).json({ mensaje: 'Error al obtener aviones' });
    }
});

app.get('/obtener-detalles-vuelo', async (req, res) => {
    try {
        const vueloId = req.query.id;

        // Utiliza Mongoose para buscar el avión por su ID
        const detallesVuelo = await Avion.findById(vueloId);

        if (!detallesVuelo) {
            return res.status(404).json({ mensaje: 'Vuelo no encontrado' });
        }

        res.status(200).json(detallesVuelo);
    } catch (error) {
        console.error('Error al obtener detalles del vuelo:', error);
        res.status(500).json({ mensaje: 'Error al obtener detalles del vuelo' });
    }
});
app.get('/buscar-vuelos', async (req, res) => {
    console.log('Recibida una solicitud para /buscar-vuelos');
    // Obtén los parámetros de búsqueda desde req.query
    const origen = req.query.Origen;
    const destino = req.query.Destino;

    try {
        // Realiza la búsqueda en la base de datos
        const vuelosEncontrados = await Avion.find({
            Origen: { $regex: new RegExp(origen, 'i') }, // Búsqueda case-insensitive
            Destino: { $regex: new RegExp(destino, 'i') },
            
        });
        console.log('Origen:', origen);
        console.log('Destino:', destino);

        // Retorna los vuelos encontrados en formato JSON
        res.status(200).json(vuelosEncontrados);
    } catch (error) {
        console.error('Error al buscar vuelos:', error);
        res.status(500).json({ mensaje: 'Error al buscar vuelos' });
    }
});



app.listen(3001, () => {
    console.log('Servidor en ejecución en el puerto 3001');
});

