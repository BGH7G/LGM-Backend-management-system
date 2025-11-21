require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const router = require('./router/index')
const path = require('path');
const app = express();
const port = process.env.PORT || 3000
const { User, sequelize } = require('./model/userModel');
require('./model/claim/claimModel');
require('./model/imageModel');
require('./model/activationCodeModel');
require('./model/lgmWeb/newsModel');
require('./model/lgmWeb/publicationModel');
require('./model/lgmWeb/memberModel');
require('./model/experimentalData/huSheepModel');
require('./model/lgmWeb/EditorImagesModel');
require('./model/lgmWeb/codeShareModel');
require('./model/datasheetModel');

app.use(morgan('dev'));

app.use('/public', express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/Code', express.static(path.join(__dirname, 'public/images/Code')));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router);

app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    const msg = err.message || 'Internal Server Error';
    res.status(status).json({ code, msg });
});

async function ensureDefaultAdmin() {
    try {
        const seed = (process.env.ADMIN_SEED || 'false').toLowerCase() === 'true';
        if (!seed) return;

        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
            console.warn('ADMIN_SEED is true but admin env vars are incomplete; skip seeding.');
            return;
        }

        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) return; // already have an admin

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            phone: ADMIN_PHONE,
            password: ADMIN_PASSWORD, // will be hashed by model hook
            role: 'admin',
        });
        console.log(`Default admin created: ${ADMIN_EMAIL}`);
    } catch (e) {
        console.error('Failed to seed default admin:', e);
    }
}

async function start() {
    try {
        await sequelize.sync();
        await ensureDefaultAdmin();
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    } catch (e) {
        console.error('Failed to start server:', e);
        process.exit(1);
    }
}

start();