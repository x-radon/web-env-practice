const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3001; // Изменённый порт

/*
// Обработка пути к одному файлу
const path = require("path");
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});
*/

// Обработка множественных статичных файлов
app.use(express.static("public")); // для HTML и других файлов
app.use("/assets", express.static("assets")); // для CSS и JS

// Настройка middleware
app.use(express.json()); // для JSON данных
//app.use(express.urlencoded({ extended: true })); // для form-data

// Подключение к базе данных
const db = mysql.createPool({
  host: "localhost",
  user: "node",
  password: "1Test_",
  database: "node_base_user",
  connectionLimit: 10,
});

// Обработка ошибок подключения
db.getConnection((err, connection) => {
  if (err) {
    console.error("Ошибка подключения к БД:", err);
    return;
  }
  connection.release();
  console.log("Подключение к БД установлено");
});

//                                                     Реализация CRUD операций

//                                             ----------  РАБОТА С ПОЛЬЗОВАТЕЛЯМИ   ----------
// Создание пользователя (Create)
app.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Валидация обязательных полей (role не входит в обязательные)
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "Заполните все обязательные поля (имя, фамилия, email, пароль)",
      });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Некорректный формат email" });
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        error: "Пароль должен быть не менее 6 символов",
      });
    }

    // Хеширование пароля
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Транзакция: вставка пользователя + связи с ролями
    await db.promise().query("START TRANSACTION");

    try {
      // Вставка пользователя
      const [userResult] = await db
        .promise()
        .query(
          "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)",
          [firstName, lastName, email, hashedPassword]
        );

      const userId = userResult.insertId;

      // Обработка ролей (только если role передан и это не пустой массив)
      if (role && Array.isArray(role) && role.length > 0) {
        // Получаем список допустимых role_id
        const [validRolesResult] = await db
          .promise()
          .query("SELECT id FROM roles");
        const validRoleIds = validRolesResult.map((row) => row.id);

        // Валидируем переданные роли
        const invalidRoles = role.filter(
          (r) => !validRoleIds.includes(Number(r))
        );
        if (invalidRoles.length > 0) {
          await db.promise().query("ROLLBACK");
          return res.status(400).json({
            error: `Недопустимые роли: ${invalidRoles.join(", ")}`,
          });
        }

        // Вставляем связи user_roles
        for (const roleId of role) {
          await db
            .promise()
            .query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
              userId,
              Number(roleId),
            ]);
        }
      }

      await db.promise().query("COMMIT");

      res.status(201).json({
        message: "Пользователь создан",
        id: userId,
        data: {
          firstName,
          lastName,
          email,
          roleIds:
            role && Array.isArray(role) ? role.map((r) => Number(r)) : [],
        },
      });
    } catch (txError) {
      await db.promise().query("ROLLBACK");
      console.error("Ошибка транзакции:", txError);

      if (txError.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "Пользователь с таким email уже существует",
        });
      }

      return res.status(500).json({
        error: "Ошибка создания пользователя",
      });
    }
  } catch (err) {
    console.error("Неожиданная ошибка:", err);
    res.status(500).json({
      error: "Внутренняя ошибка сервера",
    });
  }
});

// Получение пользователя по ID (Read one)
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const query = `
      SELECT
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        GROUP_CONCAT(ur.role_id ORDER BY ur.role_id) AS role_ids
      FROM
        users u
      LEFT JOIN
        user_roles ur ON u.id = ur.user_id
      LEFT JOIN
        roles r ON ur.role_id = r.id
      WHERE
        u.id = ?
      GROUP BY
        u.id, u.firstName, u.lastName, u.email
      ORDER BY
        u.id;
    `;

    const [results] = await db.promise().query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Формируем ответ
    const user = results[0];

    // Преобразуем строку role_ids в массив чисел (или пустой массив)
    let roleIds = [];
    if (user.role_ids) {
      roleIds = user.role_ids
        .split(",")
        .map((idStr) => parseInt(idStr.trim(), 10))
        .filter((id) => !isNaN(id)); // Фильтруем невалидные числа
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role_ids: roleIds, // Гарантированно массив: [] или [1, 5]
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({
      error: "Ошибка получения данных из базы",
    });
  }
});

// Получение списка пользователей (Read)
app.get("/users", async (req, res) => {
  try {
    const query = `
      SELECT
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        JSON_ARRAYAGG(r.name) AS roles
      FROM
        users u
      LEFT JOIN
        user_roles ur ON u.id = ur.user_id
      LEFT JOIN
        roles r ON ur.role_id = r.id
      GROUP BY
        u.id, u.firstName, u.lastName, u.email
      ORDER BY
        u.id;
    `;

    const [results] = await db.promise().query(query);

    // Преобразуем JSON-строки в массивы и обрабатываем NULL/пустые значения
    const formattedResults = results.map((user) => {
      let roles = [];

      // Если СУБД вернула строку (JSON) — парсим
      if (typeof user.roles === "string") {
        try {
          const parsedRoles = JSON.parse(user.roles);
          roles = Array.isArray(parsedRoles) ? parsedRoles : [];
        } catch (e) {
          // Если JSON невалидный — считаем, что ролей нет
          roles = [];
        }
      }
      // Если СУБД уже вернула массив (некоторые драйверы)
      else if (Array.isArray(user.roles)) {
        roles = user.roles;
      }
      // Если NULL или другое — пустой массив
      else {
        roles = [];
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: roles,
      };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({
      error: "Ошибка получения данных из базы",
    });
  }
});

// Обновление пользователя (Update)
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, password, role } = req.body;

    // Проверка обязательных полей
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "Заполните все обязательные поля (имя, фамилия, email)",
      });
    }

    // Подготовка полей для обновления в users
    const updateFields = {
      firstName,
      lastName,
      email,
    };

    // Добавляем пароль только если он передан и не пустой
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Пароль должен содержать минимум 6 символов",
        });
      }
      updateFields.password = password;
    }

    // Начинаем транзакцию для атомарности операций
    await db.promise().query("START TRANSACTION");

    try {
      // Обновление данных пользователя
      const [userResult] = await db
        .promise()
        .query("UPDATE users SET ? WHERE id = ?", [updateFields, userId]);

      if (userResult.affectedRows === 0) {
        await db.promise().query("ROLLBACK");
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // Если role передан — обрабатываем обновление ролей
      if (role !== undefined) {
        // Главное изменение: проверяем, что поле явно передано
        // Проверяем, что role — это массив и он не пустой
        if (!Array.isArray(role) || role.length === 0) {
          await db.promise().query("ROLLBACK");
          return res.status(400).json({
            error: "Поле role должно быть непустым массивом ID ролей",
          });
        }

        // Динамически получаем список всех допустимых role_id из таблицы roles
        const [validRolesResult] = await db
          .promise()
          .query("SELECT id FROM roles");
        const validRoleIds = validRolesResult.map((row) => row.id);

        // Валидация ID ролей
        const invalidRoles = role.filter(
          (r) => !validRoleIds.includes(Number(r))
        );

        if (invalidRoles.length > 0) {
          await db.promise().query("ROLLBACK");
          return res.status(400).json({
            error: `Недопустимые роли: ${invalidRoles.join(", ")}`,
          });
        }

        // Сначала удаляем все текущие роли пользователя
        await db
          .promise()
          .query("DELETE FROM user_roles WHERE user_id = ?", [userId]);

        // Затем добавляем все новые роли
        for (const roleId of role) {
          await db
            .promise()
            .query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
              userId,
              Number(roleId),
            ]);
        }
      }
      // Если role не передан — пропускаем обновление ролей (оставляем текущие)

      // Завершаем транзакцию
      await db.promise().query("COMMIT");

      res.json({ message: "Пользователь обновлён" });
    } catch (updateError) {
      await db.promise().query("ROLLBACK");
      console.error("Ошибка при обновлении пользователя:", updateError);
      throw updateError; // Перебрасываем ошибку в внешний catch
    }
  } catch (err) {
    console.error("Ошибка обновления пользователя:", err);
    res.status(500).json({ error: "Ошибка обновления данных" });
  }
});

// Удаление пользователя (Delete):
app.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db
      .promise()
      .query("DELETE FROM users WHERE id = ?", [userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ message: "Пользователь удалён" });
  } catch (err) {
    res.status(500).json({ error: "Ошибка удаления данных" });
  }
});

//                                             ----------  РАБОТА С РОЛЯМИ   ----------

// Создание новой роли
app.post("/roles", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Название роли обязательно" });
    }

    // Проверяем, существует ли роль с таким именем
    const [existingRole] = await db
      .promise()
      .query("SELECT * FROM roles WHERE name = ?", [name]);

    if (existingRole.length > 0) {
      return res
        .status(409)
        .json({ error: "Роль с таким именем уже существует" });
    }

    const [results] = await db
      .promise()
      .query("INSERT INTO roles (name) VALUES (?)", [name]);

    res.status(201).json({
      message: "Роль создана",
      role: { id: results.insertId, name },
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания роли" });
  }
});

// Обновление роли (Update)
app.put("/roles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Название роли обязательно" });
    }

    // Проверяем, существует ли роль с таким именем
    const [existingRole] = await db
      .promise()
      .query("SELECT * FROM roles WHERE name = ? AND id != ?", [name, id]);

    if (existingRole.length > 0) {
      return res
        .status(409)
        .json({ error: "Роль с таким именем уже существует" });
    }

    const [results] = await db
      .promise()
      .query("UPDATE roles SET name = ? WHERE id = ?", [name, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Роль не найдена" });
    }

    res.json({ message: "Роль обновлена" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления роли" });
  }
});

// Получение списка ролей (Read):
app.get("/roles", async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT * FROM roles");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения данных" });
  }
});

// Удаление роли
app.delete("/roles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Сначала удаляем связи из таблицы user_roles
    const [deleteUserRoles] = await db
      .promise()
      .query("DELETE FROM user_roles WHERE role_id = ?", [id]);

    // Удаляем саму роль
    const [results] = await db
      .promise()
      .query("DELETE FROM roles WHERE id = ?", [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Роль не найдена" });
    }

    res.json({ message: "Роль успешно удалена" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении роли" });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
