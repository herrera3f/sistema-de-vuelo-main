//lecture.js
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const app = express();
const rabbitMqURL = 'amqp://localhost';
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
const escrituraUserSchema = new mongoose.Schema({
    rut: String,
    nombre: String,
    correo: String,
    clave: String
});

const User = mongoose.model('User', userSchema);

const collectionName = 'nombreDeTuColeccion';
const EscrituraUser = mongoose.model('EscrituraUser', escrituraUserSchema, collectionName);

app.get('/usuarios', async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        const listaUsuarios = users.map(user => ({
            rut: user.rut,
            nombre: user.nombre,
            correo: user.correo,
        }));

        if (users.length > 0) {
            res.json({ listaUsuarios });
        } else {
            res.json("No hay registros.");
        }
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        res.status(500).send('Error al buscar usuarios');
    }
});


app.listen(3001, () => {
    console.log('Servidor en ejecución en el puerto 3001');
});

