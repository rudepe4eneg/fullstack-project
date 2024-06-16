import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';
import UserModel from './models/user.js';

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
app.post('/auth/login', async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            req.status(400).json({
                message: 'Пользователь не найден',
            });
        }

        const isValidPass = await bcrypt.compare(
            req.body.password,
            user._doc.passwordHash
        );

        if (!isValidPass) {
            return req.status(404).json({
                message: 'Неверный логин или пароль',
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        });
    }
});

// ! Регистрация пользователя !
app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            name: req.body.name,
            passwordHash: hash,
            avatarUrl: req.body.avatarUrl,
        });

        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        });
    }
});

app.get('/auth/me', (req, res) => {
    try {
    } catch (err) {}
});

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server started on port 4444');
});
