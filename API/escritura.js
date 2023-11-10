const amqp = require('amqplib');
const mysql = require('mysql');

const rabbitMqURL = 'amqp://localhost';
const mysqlConfig = {
    host: 'db4free.net',
    user: 'herrera3f',
    password: 'Bsmh.7700',
    database: 'bd_brandon',
};

async function agregarClienteEnMySQL(cliente) {
    const connection = mysql.createConnection(mysqlConfig);

    connection.connect((error) => {
        if (error) {
            console.error('Error de conexión a MySQL:', error);
            return;
        }

        const sql = 'INSERT INTO clientes (rut, nombre, correo, clave) VALUES (?, ?, ?, ?)';
        const values = [cliente.rut, cliente.nombre, cliente.correo, cliente.clave];

        connection.query(sql, values, (error, results, fields) => {
            if (error) {
                console.error('Error al insertar en MySQL:', error);
            } else {
                console.log(`Cliente agregado en MySQL. ID: ${results.insertId}`);
            }

            connection.end();
        });
    });
}

async function procesarMensajeDeEscritura(msg) {
    const comando = JSON.parse(msg.content.toString());

try {
    if (comando.operacion === 'agregar_usuario') {
        // Operación específica para agregar a MySQL
        await agregarClienteEnMySQL(comando);
        console.log('Cliente agregado en MySQL.');
    }
} catch (error) {
    console.error('Error al procesar comando en MySQL:', error);
}
}

async function iniciarConsumidor() {
    const escrituraConnection = await amqp.connect(rabbitMqURL);
    const escrituraChannel = await escrituraConnection.createChannel();

    const exchangeName = 'escritura_exchange';
    const queueName = 'escritura_queue';

    escrituraChannel.assertExchange(exchangeName, 'direct', { durable: true });
    escrituraChannel.assertQueue(queueName, { durable: true });
    escrituraChannel.bindQueue(queueName, exchangeName, 'escritura');

    escrituraChannel.prefetch(1);

    console.log('Consumidor de escritura iniciado. Esperando mensajes...');

    escrituraChannel.consume(queueName, procesarMensajeDeEscritura, { noAck: true });
}

iniciarConsumidor().catch(console.error);


