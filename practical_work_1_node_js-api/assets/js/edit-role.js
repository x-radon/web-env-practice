console.log("Загружен edit-role.js");

import { fetchUsers } from "./fetch-users.js";
import { fetchRoles } from "./fetch-roles.js";
import { showNotification } from "./utils.js";

// Функция добавления нового input
document.getElementById("addRole").addEventListener("click", () => {
  const form = document.getElementById("editRole");
  const newInput = document.createElement("div");
  newInput.classList.add("role-input");

  newInput.innerHTML = `
    <input name="new" type="text" data-role-id="" placeholder="Новая роль">
    <button type="button" class="btn btn-role-delete" title="Удалить">
      <img src="/images/del.png" alt="Удалить">
    </button>
  `;

  // Вставляем перед кнопкой "Сохранить"
  form.insertBefore(newInput, document.getElementById("save"));
});

// Функция сохранения изменений
document.getElementById("save").addEventListener("click", async () => {
  const roleInputs = document.querySelectorAll(
    "#editRole .role-input input[type='text']"
  );
  const roles = [];
  const existingNames = new Set();

  roleInputs.forEach((input) => {
    const roleId = input.dataset.roleId || null;
    const roleName = input.value.trim();

    // Пропускаем пустые поля
    if (!roleName) return;

    // Проверяем на дубликаты
    if (existingNames.has(roleName)) {
      showNotification(`Роль "${roleName}" уже существует`, { type: "error" });
      return;
    }

    roles.push({ id: roleId, name: roleName });
    existingNames.add(roleName);
  });

  // Если нет данных для сохранения
  if (roles.length === 0) {
    showNotification("Нет данных для сохранения", { type: "warning" });
    return;
  }

  try {
    // Массив промисов для параллельного выполнения запросов
    const promises = roles.map(async (role) => {
      const url = role.id ? `/roles/${role.id}` : "/roles";
      const method = role.id ? "PUT" : "POST";

      return fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: role.name }),
      });
    });

    await Promise.all(promises);
    showNotification("Роли успешно сохранены");

    // Перезагрузка данных
    await fetchUsers();
    await fetchRoles();
  } catch (error) {
    showNotification(`Ошибка при сохранении: ${error.message}`, {
      type: "error",
    });
    console.error("Ошибка API:", error);
  }
});
