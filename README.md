# МДК.01.01*3с* Практическая работа №2 Создание сервера на Node.js с использованием Express

## Краткое описание проекта

Описание проекта
Проект представляет собой серверную часть приложения с REST API для управления пользователями и ролями. Реализованы базовые CRUD операции и система работы с базой данных.

Структура проекта

project/
├── assets
│   ├── css
│   │   ├── style.css
│   │   └── utils.css
│   └── js
│       ├── create-user.js
│       ├── delete-role.js
│       ├── delete-user.js
│       ├── edit-role.js
│       ├── fetch-roles.js
│       ├── fetch-users.js
│       ├── main.js
│       ├── update-user.js
│       └── utils.js
├── index.js
├── node_modules
├── package.json
├── package-lock.json
└── public
    ├── images
    │   ├── del.png
    │   └── edit.png
    └── index.html

#Установка и запуск
Требования
Node.js (версия 14.x или выше)

npm (встроенный в Node.js)

Установка
Клонируйте репозиторий:

bash
git clone <ссылка-на-репозиторий>
Установите зависимости:

bash
npm install
Запуск
Для запуска сервера выполните:

bash
npm start
Сервер будет доступен по адресу:

API документация
Пользователи
Создание пользователя
POST /users

json
{
"firstName": "string",
"lastName": "string",
"email": "string",
"password": "string",
"role": [1, 2]
}
Получение списка пользователей
GET /users

Получение пользователя
GET /users/:id

Обновление пользователя
PUT /users/:id

json
{
"firstName": "string",
"lastName": "string",
"email": "string",
"password": "string",
"role": [1, 2]
}
Удаление пользователя
DELETE /users/:id

Роли
Создание роли
POST /roles

json
{
"name": "string"
}
Получение списка ролей
GET /roles

Обновление роли
PUT /roles/:id

json
{
"name": "string"
}
Удаление роли
DELETE /roles/:id

Используемые технологии
Node.js - среда выполнения

Express.js - веб-фреймворк

MySQL - база данных

bcrypt - хеширование паролей

mysql2 - драйвер MySQL

Разработка
Для разработки рекомендуется использовать:

VS Code или другой редактор кода

Postman для тестирования API

Nodemon для автоматического перезапуска сервера

Тестирование
Для тестирования API можно использовать:

Postman

curl команды
