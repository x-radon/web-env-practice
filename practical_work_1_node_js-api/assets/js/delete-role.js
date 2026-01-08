console.log("Загружен delete-role.js");

import { fetchUsers } from "./fetch-users.js";
import { fetchRoles } from "./fetch-roles.js";
import { showNotification } from "./utils.js";

// Функция удаления роли по клику на кнопку
//document.querySelectorAll(".btn-role-delete").forEach((button) => {
//  button.addEventListener("click", async (e) => {
//    e.preventDefault();

document.addEventListener("click", async (e) => {
  // Проверяем, является ли целевой элемент кнопкой с классом btn-role-delete
  // или его потомком (например, <img> внутри кнопки)
  const button = e.target.closest(".btn-role-delete");

  if (!button) {
    return; // Если кнопка не найдена — выходим
  }

  const roleId = button.dataset.roleId;

  // Если roleId пустой или не существует — удаляем родительский элемент
  if (!roleId) {
    console.warn(
      "Атрибут data-role-id не найден. Удаляем родительский элемент."
    );
    const parent = button.parentElement;
    if (parent) {
      parent.remove();
    }
    return; // Прерываем выполнение, так как удалять на сервере нечего
  }

  try {
    const response = await fetch(`/roles/${roleId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("Роль удалена");
      await fetchUsers();
      await fetchRoles();
    } else {
      const errorData = await response.json();
      showNotification(errorData.error || "Ошибка при удалении роли", {
        type: "error",
      });
    }
  } catch (error) {
    showNotification("Произошла ошибка при удалении", { type: "error" });
    console.error("Ошибка:", error);
  }
});
