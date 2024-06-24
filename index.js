import express from 'express';

import mongoose from 'mongoose';

import { registerValidation } from './validations/auth.js';

import checkAuth from './utils/checkAuth.js';
import { getMe, login, register } from './controllers/UserController.js';

// ! Подключение к MongoDB
mongoose
    .connect(
        'mongodb+srv://rudepe4eneg:arpa1983@cluster0.fcx3xl3.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0'
    )
    .then(() => console.log('Database connected'))
    .catch((err) => console.log('Database error', err));

const app = express();

app.use(express.json());

// ! Аутентификация пользователя !
app.post('/auth/login', login);

// ! Регистрация пользователя !
app.post('/auth/register', registerValidation, register);

app.get('/auth/me', checkAuth, getMe);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server started on port 4444');
});
