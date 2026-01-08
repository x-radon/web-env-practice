console.log("Загружен fetch-users.js");

import { showNotification } from "./utils.js";

// Функция отображения списка пользователей
async function fetchUsers() {
  try {
    const response = await fetch("/users");
    const users = await response.json();

    const container = document.querySelector(".container");
    let userList = document.getElementById("userList");

    userList.innerHTML = "";

    users.forEach((user) => {
      const li = document.createElement("li");

      // Формируем строку с ролями (разделяем запятой)
      const rolesString = Array.isArray(user.roles)
        ? user.roles.join(", ")
        : user.roles || "Нет ролей";

      // Улучшенная HTML-разметка с семантическими элементами
      li.innerHTML = `
        <div class="user-item">
          <div class="user-info">
            <span class="info-label">ID:</span> ${user.id}<br>
            <span class="info-label">Роль:</span> ${rolesString}<br>
            <span class="info-label">Имя:</span> ${user.firstName}<br>
            <span class="info-label">Фамилия:</span> ${user.lastName}<br>
            <span class="info-label">Email:</span> ${user.email}
          </div>
          <div class="user-actions">
            <button 
              type="button"
              class="btn btn-user-delete"
              data-user-id="${user.id}"
              title="Удалить"
            >
              <img src="/images/del.png" alt="Удалить">
            </button>
            <button
              type="button"
              class="btn btn-edit"
              data-user-id="${user.id}"
              title="Изменить"
            >
              <img src="/images/edit.png" alt="Изменить">
            </button>
          </div>
        </div>
      `;

      userList.appendChild(li);
    });
  } catch (error) {
    console.error("Ошибка при получении списка пользователей:", error);
    showNotification(error, { type: "error" });
  }
}

// Экспортируем функцию для возможности импорта
export { fetchUsers };
