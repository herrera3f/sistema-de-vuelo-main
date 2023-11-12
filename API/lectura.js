const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://benjaminmartinez29:Martinez890@User.bhz2ags.mongodb.net/User?retryWrites=true&w=majority';
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
    correo: String,
    clave: String
});

const User = mongoose.model('User', userSchema);

const escrituraUserSchema = new mongoose.Schema({
    rut: String,
    nombre: String,
    correo: String,
    clave: String
});
const collectionName = 'sistema_reserva';
const EscrituraUser = mongoose.model('EscrituraUser', escrituraUserSchema, collectionName);



app.post('/autenticar-usuario', async (req, res) => {
    const { correo, clave } = req.body;

    try {
        // Utiliza el modelo User para acceder a la colección
        const user = await User.findOne({ correo, clave });

        if (user) {
            res.status(200).json({ mensaje: 'Autenticación exitosa', usuario: user });
        } else {
            res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ mensaje: 'Error al autenticar usuario' });
    }
});



app.listen(3001, () => {
    console.log('Servidor en ejecución en el puerto 3001');
});
