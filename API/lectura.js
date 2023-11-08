const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const app = express();

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
const collectionName = 'nombreDeTuColeccion'; 
const EscrituraUser = mongoose.model('EscrituraUser', escrituraUserSchema, collectionName);

async function recibirYProcesarComandosDeEscritura() {
    const lecturaConnection = await amqp.connect('amqp://localhost');
    const lecturaChannel = await lecturaConnection.createChannel();

    const exchangeName = 'escritura_exchange';
    const queueName = 'escritura_queue';

    lecturaChannel.assertQueue(queueName, { durable: true });
    lecturaChannel.bindQueue(queueName, exchangeName, 'escritura');

    lecturaChannel.consume(queueName, async (msg) => {
        const comando = JSON.parse(msg.content.toString());

        try {
            if (comando.id) {
                await User.findByIdAndUpdate(comando.id, comando, { upsert: true });
                console.log('Cliente actualizado en MongoDB.');

                const escrituraUser = new EscrituraUser(comando);
                await escrituraUser.save();
                console.log('Cliente actualizado en la base de datos de escritura (MySQL).');
            } else {
                await User.create(comando);
                console.log('Cliente agregado en MongoDB.');

                const escrituraUser = new EscrituraUser(comando);
                await escrituraUser.save();
                console.log('Cliente agregado en la base de datos de escritura (MySQL).');
            }
        } catch (error) {
            console.error('Error al procesar comando en MongoDB:', error);
        }
    }, { noAck: true });
}

recibirYProcesarComandosDeEscritura().catch(console.error);

app.get('/usuarios', async (req, res) => {
    try {
        const users = await User.find().select('-__v');

        if (users.length > 0) {
            res.json({ listaClientes: users });
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
