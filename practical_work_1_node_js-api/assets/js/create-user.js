console.log("Загружен create-user.js");

import { fetchUsers } from "./fetch-users.js";
import { showNotification } from "./utils.js";

// Получаем кнопку и привязываем обработчик клика
const createButton = document.getElementById("create");
createButton.addEventListener("click", async () => {
  try {
    // Собираем и валидируем данные из формы
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password1 = document.getElementById("password1").value;
    const password2 = document.getElementById("password2").value;

    const roleSelect = document.getElementById("role");
    const selectedRoles = [];

    // Получаем выбранные роли
    for (const option of roleSelect.options) {
      if (option.selected && option.value) {
        selectedRoles.push(Number(option.value));
      }
    }

    // Валидация полей
    if (!firstName || !lastName || !email) {
      showNotification(
        "Заполните все обязательные поля (имя, фамилия, email)",
        { type: "error" }
      );
      return;
    }

    if (!password1 || !password2) {
      showNotification("Введите пароль дважды", { type: "error" });
      return;
    }

    if (password1 !== password2) {
      const label = document.querySelector('label[for="password1"]');
      showNotification("Пароли не совпадают!", {
        container: label.parentElement,
        type: "error",
      });
      return;
    }

    if (password1.length < 6) {
      showNotification("Пароль должен содержать минимум 6 символов", {
        type: "error",
      });
      return;
    }

    // Отправляем данные на сервер
    const response = await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password: password1,
        role: selectedRoles,
      }),
    });

    if (response.ok) {
      showNotification("Пользователь успешно создан");
      fetchUsers();
      document.getElementById("form").reset();
    } else {
      const errorData = await response.json().catch(() => ({}));
      showNotification(errorData.error || "Ошибка при создании пользователя", {
        type: "error",
      });
    }
  } catch (error) {
    console.error("Ошибка сети или сервера:", error);
    showNotification(
      "Произошла сетевая ошибка. Проверьте подключение и попробуйте снова.",
      { type: "error" }
    );
  }
});
