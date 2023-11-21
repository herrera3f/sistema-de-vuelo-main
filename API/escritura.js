// escritura.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const mongoose = require('mongoose');
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
                    case'mysql_reserva':
                        await realizarOperacionMySQL(comando);
                        break;
                    case 'mongodb_reserva':
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

        if (comando.operacion === 'mysql_reserva') {
            
            // Verifica si la reserva ya existe en la base de datos
            const reservaExistente = await new Promise((resolve, reject) => {
                const sql = 'SELECT * FROM reserva WHERE `ID_Reserva` = ?';// Ajusta esto según tu modelo de datos
                conexionMySQL.query(sql, [comando.campo_uniqueness], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.length > 0 ? results[0] : null);
                    }
                });
            });

            if (!reservaExistente) {
                // La reserva no existe, realiza una inserción
                const sql = 'INSERT INTO reserva (`ID_Vuelos`, `Nombre_Apellido`, Pais, `Numero_de_Documento`, `Fecha_de_Nacimiento`, Sexo, Email, Telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [comando['ID_Vuelos'], comando['Nombre_Apellido'], comando.Pais, comando['Numero_de_Documento'], comando['Fecha_de_Nacimiento'], comando.Sexo, comando.Email, comando.Telefono];


                

                await new Promise((resolve, reject) => {
                    conexionMySQL.query(sql, values, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log('Reserva agregada en MySQL.');
                            resolve();
                        }
                    });
                });
            }
        } else if (comando.operacion === 'mysql') {
            // Manejar la operación de registro de usuarios
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

            if (!clienteExistente) {
                // El cliente no existe, realiza una inserción
                const sql = 'INSERT INTO clientes (rut, nombre, email, contraseña) VALUES (?, ?, ?, ?)';
                const values = [comando.rut, comando.nombre, comando.email, comando.contraseña];

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
    console.log('Comando recibido:', comando);
    if (comando) {
        const mongoURI = 'mongodb+srv://benjaminmartinez29:Martinez890@User.bhz2ags.mongodb.net/sistema_reserva?retryWrites=true&w=majority';

        try {
            const conexionMongoDB = mongoose.createConnection(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Conexión a MongoDB establecida con éxito.');

            if (comando.operacion === 'mongodb') {
                const usuarioSchema = new mongoose.Schema({
                    rut: String,
                    nombre: String,
                    email: String,
                    contraseña: String,
                      
                });

                const Usuario = conexionMongoDB.model('usuarios', usuarioSchema);

                if (comando.id) {
                    await Usuario.findByIdAndUpdate(comando.id, comando, { upsert: true });
                    console.log('Usuario actualizado en MongoDB.');
                } else {
                    await Usuario.create(comando);
                    console.log('Usuario agregado en MongoDB.');
                }
            } else if (comando.operacion === 'mongodb_reserva') {
                const ReservaSchema = new mongoose.Schema({
                    ID_Vuelos: String,
                    Nombre_Apellido: String,
                    Pais: String,
                    Numero_de_Documento: String,
                    Fecha_de_Nacimiento: String,
                    Sexo: String,
                    Email: String,
                    Telefono: String,
                    
                });

                const Reserva = conexionMongoDB.model('Reserva', ReservaSchema);

                if (comando.id) {
                    await Reserva.findByIdAndUpdate(comando.id, comando, { upsert: true });
                    console.log('Reserva actualizada en MongoDB.');
                } else {
                    await Reserva.create(comando);
                    console.log('Reserva agregada en MongoDB.');
                }
            } else {
                console.error('Operación no válida:', comando.operacion);
            }

            // Publicar el mensaje, independientemente de la operación
            
        } catch (error) {
            console.error('Error al realizar operación en MongoDB:', error);
        } finally {
            conexionMongoDB.close();
        }
    }
}
