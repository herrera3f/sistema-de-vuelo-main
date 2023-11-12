// escritura.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://benjaminmartinez29:Martinez890@User.bhz2ags.mongodb.net/User?retryWrites=true&w=majority';
// Configuración de RabbitMQ
const rabbitMqURL = 'amqp://localhost';
const exchangeName = 'escritura_exchange'; // Usar el exchange principal
const queueName = 'escritura_queue'; // Usar la cola principal
const routingKey = 'escritura'; // Usar la routing key principal


const app = express();
app.use(bodyParser.json());

const PUERTO = 3000;

const conexion = mysql.createConnection({
    host: 'db4free.net',
    database: 'bd_brandon',
    user: 'herrera3f',
    password: 'Bsmh.7700',
});


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


async function recibirYProcesarComandos() {
    const connection = await amqp.connect(rabbitMqURL);
    const channel = await connection.createChannel();

    // Asegúrate de que el exchange esté declarado correctamente
    channel.assertExchange(exchangeName, 'direct', { durable: true });

    // Asegúrate de que la cola esté declarada correctamente
    channel.assertQueue(queueName, { durable: true });

    // Asegúrate de que la cola esté vinculada al exchange con la routing key adecuada
    channel.bindQueue(queueName, exchangeName, routingKey);

    // ...
    
    channel.consume(queueName, async (msg) => {
        const comando = JSON.parse(msg.content.toString());

        try {
            const operacion = comando.operacion;

            if (operacion) {  // Verificar si la propiedad 'operacion' está definida
                switch (operacion) {
                    case 'mysql':
                        await realizarOperacionMySQL(comando);
                        break;
                    case 'mongodb':
                        await realizarOperacionMongoDB(comando);
                        break;
                    default:
                        console.warn('Operación no reconocida. Ignorando:', operacion);
                        // Aquí puedes tomar alguna acción adicional si es necesario
                }
            } else {
                console.warn('Operación no definida en el comando. Ignorando el comando:', comando);
            }
        } catch (error) {
            console.error('Error al procesar el comando:', error);
        }
    }, { noAck: true });
}


// Iniciar la recepción y procesamiento de comandos
recibirYProcesarComandos().catch(console.error);


// Función para enviar comandos a RabbitMQ


// Función para enviar mensajes de escritura a RabbitMQ


// Función para publicar mensajes en RabbitMQ
async function publicarMensajeDeEscritura(comando) {
    const connection = await amqp.connect(rabbitMqURL);
    const channel = await connection.createChannel();

    const exchangeName = 'escritura_exchange';
    const queueName = 'escritura_queue';

    channel.assertExchange(exchangeName, 'direct', { durable: true });
    channel.assertQueue(queueName, { durable: true });
    channel.bindQueue(queueName, exchangeName, 'escritura');

    channel.publish(exchangeName, 'escritura', Buffer.from(JSON.stringify(comando)));
}

async function enviarMensajeDeEscrituraMySQL(comando) {
    await publicarMensajeDeEscritura(comando);
    const connection = await amqp.connect(rabbitMqURL);
    const channel = await connection.createChannel();

    const exchangeName = 'escritura_exchange';
    const queueName = 'escritura_queue';

    channel.assertExchange(exchangeName, 'direct', { durable: true });
    channel.assertQueue(queueName, { durable: true });
    channel.bindQueue(queueName, exchangeName, 'escritura');

    channel.publish(exchangeName, 'escritura', Buffer.from(JSON.stringify(comando)));
}

async function enviarMensajeDeEscrituraMongo(comando) {
    const connection = await amqp.connect(rabbitMqURL);
    const channel = await connection.createChannel();

    const exchangeName = 'escritura_exchange';
    const queueName = 'escritura_queue';

    channel.assertExchange(exchangeName, 'direct', { durable: true });
    channel.assertQueue(queueName, { durable: true });
    channel.bindQueue(queueName, exchangeName, 'escritura');

    channel.publish(exchangeName, 'escritura', Buffer.from(JSON.stringify(comando)));
}
async function realizarOperacionMySQL(comando) {
    console.log('Comando recibido:', comando);
    const conexionMySQL = mysql.createConnection({
        host: 'db4free.net',
        database: 'bd_brandon',
        user: 'herrera3f',
        password: 'Bsmh.7700',
    });

    try {
        await new Promise((resolve, reject) => {
            conexionMySQL.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        if (comando.operacion === 'mysql') {
            // Verifica si el cliente ya existe en la base de datos
            const clienteExistente = await new Promise((resolve, reject) => {
                const sql = 'SELECT * FROM clientes WHERE rut = ?';
                conexionMySQL.query(sql, [comando.rut], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.length > 0 ? results[0] : null);
                    }
                });
            });

            if (clienteExistente) {
                // El cliente existe, realiza una actualización
                const sql = 'UPDATE clientes SET nombre = ?, correo = ?, clave = ? WHERE rut = ?';
                const values = [comando.nombre, comando.correo, comando.clave, comando.rut];

                await new Promise((resolve, reject) => {
                    conexionMySQL.query(sql, values, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log('Cliente actualizado en MySQL.');
                            resolve();
                        }
                    });
                });
            } else {
                // El cliente no existe, realiza una inserción
                const sql = 'INSERT INTO clientes (rut, nombre, correo, clave) VALUES (?, ?, ?, ?)';
                const values = [comando.rut, comando.nombre, comando.correo, comando.clave];

                await new Promise((resolve, reject) => {
                    conexionMySQL.query(sql, values, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log('Cliente agregado en MySQL.');
                            resolve();
                        }
                    });
                });
            }

            comando.operacion = 'mysql';
            publicarMensajeDeEscrituraMySQL({ ...comando, operacion: 'mysql' });
        } else {
            console.error('Operación no válida:', comando.operacion);
        }
    } catch (error) {
        console.error('Error al realizar operación en MySQL:', error);
    } finally {
        conexionMySQL.end();
    }
}
// Función para realizar operaciones en MongoDB
async function realizarOperacionMongoDB(comando) {
    if (comando && comando.operacion === 'mongodb') {
        const mongoURI = 'mongodb+srv://benjaminmartinez29:Martinez890@User.bhz2ags.mongodb.net/User?retryWrites=true&w=majority';

        try {
            const conexionMongoDB = mongoose.createConnection(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            const usuarioSchema = new mongoose.Schema({
                rut: String,
                nombre: String,
                correo: String,
                clave: String,
            });

            const Usuario = conexionMongoDB.model('Usuario', usuarioSchema);

            if (comando.id) {
                await Usuario.findByIdAndUpdate(comando.id, comando, { upsert: true });
                console.log('Cliente actualizado en MongoDB.');
            } else {
                await Usuario.create(comando);
                console.log('Cliente agregado en MongoDB.');
            }

            comando.operacion = 'mongodb';
            publicarMensajeDeEscrituraMongo({ ...comando, operacion: 'mongodb' });
        } catch (error) {
            console.error('Error al realizar operación en MongoDB:', error);
        } finally {
            conexionMongoDB.close();
        }
    }
}

app.post('/cliente/agregar', async (req, res) => {
    try {
        const cliente = {
            rut: req.body.rut,
            nombre: req.body.nombre,
            correo: req.body.correo,
            clave: req.body.clave,
        };

        await enviarMensajeDeEscrituraMySQL({ ...cliente, operacion: 'mysql' });
        await enviarMensajeDeEscrituraMongo({ ...cliente, operacion: 'mongodb' });

        res.json('Cliente agregado correctamente');
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        res.status(500).json('Error interno del servidor');
    }
});
app.put('/cliente/actualizar/:id', (req, res) => {
    const { id } = req.params;
    const cliente = {
        rut: req.body.rut,
        nombre: req.body.nombre,
        correo: req.body.correo,
        clave: req.body.clave,
    };

    // Publica el comando de actualización en RabbitMQ para MySQL
    enviarMensajeDeEscrituraMySQL({ id, ...cliente });

    // Publica el comando de actualización en RabbitMQ para MongoDB
    enviarMensajeDeEscrituraMongo({ id, ...cliente });

    res.json('Cliente actualizado correctamente');
});

app.delete('/cliente/eliminar/:id', (req, res) => {
    const { id } = req.params;

    // Publica el comando de eliminación en RabbitMQ para MySQL
    enviarMensajeDeEscrituraMySQL({ id });

    // Publica el comando de eliminación en RabbitMQ para MongoDB
    enviarMensajeDeEscrituraMongo({ id });

    res.json('Cliente eliminado correctamente');
});
// Función principal para recibir y procesar comandos

