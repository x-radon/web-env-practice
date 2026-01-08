console.log("Загружен delete-user.js");

import { fetchUsers } from "./fetch-users.js";
import { showNotification } from "./utils.js";

// Функция удаления пользователя по клику на кнопку с изображением
document.addEventListener("click", async (e) => {
  const button = e.target.closest(".btn-user-delete");

  if (!button) {
    return; // Если кнопка не найдена — выходим
  }

  console.log("Test DEL");
  // Получаем ID пользователя из data-атрибута
  const userId = button.dataset.userId;

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("Пользователь удалён");
      fetchUsers(); // Обновляем список пользователей
    } else {
      showNotification("Ошибка при удалении пользователя", {
        type: "error",
      });
    }
  } catch (error) {
    showNotification(error, { type: "error" });
    console.error("Ошибка:", error);
  }
});
