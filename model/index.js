const {Sequelize} = require('sequelize');

const {
    DB_HOST = 'localhost',
    DB_PORT = '3306',
    DB_NAME = 'datalgm',
    DB_USER = 'bghong7g',
    DB_PASS = '44269911',
    DB_POOL_MAX = '10',
    DB_POOL_MIN = '0',
    DB_POOL_IDLE = '10000',
    DB_POOL_ACQUIRE = '30000',
    DB_TIMEZONE = '+08:00',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'mysql',
    pool: {
        max: Number(DB_POOL_MAX),
        min: Number(DB_POOL_MIN),
        acquire: Number(DB_POOL_ACQUIRE),
        idle: Number(DB_POOL_IDLE),
    },
    timezone: DB_TIMEZONE,
})

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection()
    .then(() => {
    })
    .catch(error => {
        console.error(error)
    });


module.exports = sequelize;