# МДК.01.01*3с* Практическая работа №2 Создание сервера на Node.js с использованием Express

## Краткое описание проекта

Описание проекта
Проект представляет собой серверную часть приложения с REST API для управления пользователями и ролями. Реализованы базовые CRUD операции и система работы с базой данных.

Структура проекта

<pre><code>
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
</code></pre>

# Установка и запуск

## Требования

Node.js (версия 14.x или выше)

npm (встроенный в Node.js)

## Установка

<pre><code>bash
npm install
</code></pre>

## Запуск

Для запуска сервера выполните:

<pre><code>bash
npm start
</code></pre>

Сервер будет доступен по адресу:
http://localhost:8000

# API документация

## Пользователи

### Создание пользователя

<pre><code>POST /users</code></pre>

<pre><code>json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": [1, 2]
}
</code></pre>

### Получение списка пользователей

<pre><code>GET /users</code></pre>

### Получение пользователя

<pre><code>GET /users/:id</code></pre>

### Обновление пользователя

<pre><code>PUT /users/:id</code></pre>

<pre><code>json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": [1, 2]
}
</code></pre>

### Удаление пользователя

<pre><code>DELETE /users/:id</code></pre>

## Роли

### Создание роли

<pre><code>POST /roles</code></pre>

<pre><code>json
{
  "name": "string"
}
</code></pre>

### Получение списка ролей

<pre><code>GET /roles</code></pre>

### Обновление роли

<pre><code>PUT /roles/:id</code></pre>

<pre><code>json
{
  "name": "string"
}
</code></pre>

### Удаление роли

<pre><code>DELETE /roles/:id</code></pre>

# Используемые технологии

Node.js — среда выполнения

Express.js — веб‑фреймворк

MySQL — база данных

bcrypt — хеширование паролей

mysql2 — драйвер MySQL

# Разработка

Для разработки рекомендуется использовать:

VS Code или другой редактор кода

Postman для тестирования API

Nodemon для автоматического перезапуска сервера

# Тестирование

Для тестирования API можно использовать:

Postman

curl команды
