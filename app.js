require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const router = require('./router/index')
const path = require('path');
const app = express();
const port = process.env.PORT || 3000
const { User, sequelize } = require('./model/userModel');

app.use(morgan('dev'));

app.use('/public',express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router);

app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    const code   = err.code || 'SERVER_ERROR';
    const msg    = err.message || 'Internal Server Error';
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

        // Ensure tables are ready (safe to call multiple times)
        await sequelize.sync();

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

// kick off admin seeding (non-blocking)
ensureDefaultAdmin();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})