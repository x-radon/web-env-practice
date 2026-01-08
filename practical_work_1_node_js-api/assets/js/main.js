console.log("Загружен main.js");
// Подключаем вспомогательные функции
import "./utils.js";

// Подключаем функцию загрузки пользователей
import { fetchUsers } from "./fetch-users.js";

// Подключаем функцию загрузки роли
import { fetchRoles } from "./fetch-roles.js";

// Подключаем обработчики событий
import("./create-user.js");
import("./update-user.js");
import("./delete-user.js");

import("./edit-role.js"); // Создание/обновление роли объеденены в одну функцию
import("./delete-role.js");

// Инициализируем приложение
document.addEventListener("DOMContentLoaded", () => {
  // Загружаем список пользователей и ролей при загрузке страницы
  fetchUsers();
  fetchRoles();
});
