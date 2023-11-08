const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

const PUERTO = 3000;

const conexion = mysql.createConnection({
    host: 'db4free.net',
    database: 'bd_brandon',
    user: 'herrera3f',
    password: 'Bsmh.7700',
});

// Conexión a RabbitMQ
const rabbitMqURL = 'amqp://localhost';

app.listen(PUERTO, () => {
    console.log(`Servidor compilado desde el puerto ${PUERTO}`);
});

conexion.connect((error) => {
    if (error) throw error;
    console.log('Conexión exitosa a MySQL');
});

app.get('/', (req, res) => {
    res.send('Nuestra API está casi funcionando');
});

app.post('/cliente/agregar', (req, res) => {
    const cliente = {
        rut: req.body.rut,
        nombre: req.body.nombre,
        correo: req.body.correo,
        clave: req.body.clave,
    };

    // Publica el comando en RabbitMQ
    enviarMensajeDeEscritura(cliente);

    res.json('Cliente agregado correctamente');
});

app.put('/cliente/actualizar/:id', (req, res) => {
    const { id } = req.params;
    const cliente = {
        rut: req.body.rut,
        nombre: req.body.nombre,
        correo: req.body.correo,
        clave: req.body.clave,
    };

    // Publica el comando de actualización en RabbitMQ
    enviarMensajeDeEscritura({ id, ...cliente });

    res.json('Cliente actualizado correctamente');
});

app.delete('/cliente/eliminar/:id', (req, res) => {
    const { id } = req.params;

    // Publica el comando de eliminación en RabbitMQ
    enviarMensajeDeEscritura({ id });

    res.json('Cliente eliminado correctamente');
});

// Función para enviar comandos a RabbitMQ
async function enviarMensajeDeEscritura(comando) {
    const escrituraConnection = await amqp.connect(rabbitMqURL);
    const escrituraChannel = await escrituraConnection.createChannel();

    const exchangeName = 'escritura_exchange';

    escrituraChannel.assertExchange(exchangeName, 'direct', { durable: true });

    // Publica el mensaje en el exchange
    escrituraChannel.publish(exchangeName, 'escritura', Buffer.from(JSON.stringify(comando)));

    // Insertar o actualizar en MySQL
    if (comando.id) {
        const sql = 'UPDATE clientes SET rut = ?, nombre = ?, correo = ?, clave = ? WHERE id = ?';
        const values = [comando.rut, comando.nombre, comando.correo, comando.clave, comando.id];

        conexion.query(sql, values, (error) => {
            if (error) {
                console.error('Error al actualizar en MySQL: ' + error);
            } else {
                console.log('Cliente actualizado en MySQL.');
            }
        });
    } else {
        const sql = 'INSERT INTO clientes (rut, nombre, correo, clave) VALUES (?, ?, ?, ?)';
        const values = [comando.rut, comando.nombre, comando.correo, comando.clave];

        conexion.query(sql, values, (error) => {
            if (error) {
                console.error('Error al insertar en MySQL: ' + error);
            } else {
                console.log('Cliente agregado en MySQL.');
            }
        });
    }
}

