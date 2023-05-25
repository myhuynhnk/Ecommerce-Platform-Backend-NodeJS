require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3056;

const server = app.listen(PORT, () => {
    console.log(`Ecommerce server start on port: ${PORT}`);
})

// process.on('SIGINT', () => {
//     server.close(() => console.log(`Exit Server Express`));
//     // notyfi.send('....');
// })

