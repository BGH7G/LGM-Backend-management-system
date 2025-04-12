const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('datalgm', 'bghong7g', '44269911', {
    host: 'localhost',
    dialect: 'mysql',
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