console.log("Загружен update-user.js");

import { fetchUsers } from "./fetch-users.js";
import { showNotification } from "./utils.js";

function clearSelect() {
  // Получаем элемент select для ролей
  const roleSelect = document.getElementById("role");

  // Очищаем текущий выбор (снимаем selected со всех опций)
  for (const option of roleSelect.options) {
    option.selected = false;
  }
  return roleSelect;
}

/// Функция загрузки данных пользователя по ID
async function loadUser(userId) {
  try {
    const response = await fetch(`/users/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        showNotification("Пользователь не найден", { type: "error" });
      } else {
        showNotification("Ошибка при загрузке данных пользователя", {
          type: "error",
        });
      }
      return;
    }

    const user = await response.json();

    // Заполняем поля формы
    document.getElementById("userId").value = user.id;
    document.getElementById("firstName").value = user.firstName || "";
    document.getElementById("lastName").value = user.lastName || "";
    document.getElementById("email").value = user.email || "";

    // Очищаем текущий выбор (снимаем selected со всех опций)
    const roleSelect = clearSelect();

    // Если role_ids есть и это массив с элементами
    if (
      user.role_ids &&
      Array.isArray(user.role_ids) &&
      user.role_ids.length > 0
    ) {
      // Проходим по всем ID ролей из массива
      for (const roleId of user.role_ids) {
        // Ищем опцию с соответствующим value и устанавливаем selected
        for (const option of roleSelect.options) {
          if (option.value === String(roleId)) {
            option.selected = true;
            break; // Выходим после установки selected для текущей роли
          }
        }
      }
    }

    // Оставляем поля паролей пустыми (пользователь может не менять пароль)
    document.getElementById("password1").value = "";
    document.getElementById("password2").value = "";

    console.log("Данные пользователя загружены:", user);
  } catch (error) {
    console.error("Ошибка загрузки пользователя:", error);
    showNotification("Не удалось загрузить данные пользователя", {
      type: "error",
    });
  }
}

// Функция переключения формы в режим редактирования
function enterEditMode() {
  // Обновляем заголовок формы
  document.getElementById("formTitle").textContent =
    "Изменить данные пользователя";

  const form = document.getElementById("form");
  const submitBtn = form.querySelector("button[type='button']");

  // Если кнопка "Изменить" уже существует — ничего не делаем
  if (document.getElementById("edit")) {
    return;
  }

  // Создаём новые кнопки
  const clearButton = document.createElement("button");
  clearButton.id = "clear";
  clearButton.type = "button";
  clearButton.textContent = "Очистить";

  const roleSelect = document.getElementById("role");
  roleSelect.insertAdjacentElement("afterend", clearButton);

  const editButton = document.createElement("button");
  editButton.id = "edit";
  editButton.type = "button";
  editButton.textContent = "Изменить";

  const undoButton = document.createElement("button");
  undoButton.id = "undo";
  undoButton.type = "button";
  undoButton.textContent = "Отмена";

  // Заменяем существующую кнопку на новые
  if (submitBtn) {
    submitBtn.replaceWith(editButton, undoButton);
  } else {
    // Если кнопки button не найдено — добавляем в конец формы
    form.append(editButton, undoButton);
  }

  // Обработчик кнопки "Очистить"
  clearButton.addEventListener("click", () => {
    // Очищаем текущий выбор (снимаем selected со всех опций)
    clearSelect();
  });

  // Обработчик кнопки "Изменить"
  editButton.addEventListener("click", () => {
    editUser(new Event("submit"));
  });

  // Обработчик кнопки "Отмена"
  undoButton.addEventListener("click", () => {
    resetForm();
  });
}

// Функция возврата формы в исходное состояние
function resetForm() {
  document.getElementById("formTitle").textContent = "Создать пользователя";

  const buttons = document.querySelectorAll("#form button");
  buttons.forEach((btn) => btn.remove());

  const newBtn = document.createElement("button");
  newBtn.type = "button";
  newBtn.id = "create";
  newBtn.textContent = "Создать";
  document.querySelector("#form").appendChild(newBtn);

  // Очищаем поля
  document.getElementById("form").reset();
  document.getElementById("userId").value = "";
}

// Обработчик отправки формы (редактирование)
async function editUser(e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const roleSelect = document.getElementById("role");
  const password1 = document.getElementById("password1").value;
  const password2 = document.getElementById("password2").value;

  // Проверка ID
  if (!userId) {
    showNotification("Ошибка: ID пользователя не указан.", { type: "error" });
    return;
  }

  // Проверка обязательных полей (кроме пароля)
  if (!firstName || !lastName || !email) {
    showNotification("Заполните все обязательные поля (имя, фамилия, email)", {
      type: "error",
    });
    return;
  }

  // Проверка совпадения паролей (только если пароль введён)
  if (password1 && password1 !== password2) {
    const label = document.querySelector('label[for="password"]');
    showNotification("Пароли не совпадают!", {
      container: label.parentElement,
      type: "error",
    });
    return;
  }

  // Подготовка данных для отправки
  const data = {
    firstName,
    lastName,
    email,
  };

  // Собираем выбранные роли из мультиселекта
  const selectedRoles = [];
  for (const option of roleSelect.options) {
    if (option.selected) {
      selectedRoles.push(Number(option.value)); // Преобразуем в число
    }
  }

  // Добавляем роли в запрос только если они выбраны
  if (selectedRoles.length > 0) {
    data.role = selectedRoles; // Массив чисел: [1, 3]
  }

  // Добавляем пароль в запрос только если он заполнен
  if (password1) {
    // Дополнительная проверка длины пароля (если он есть)
    if (password1.length < 6) {
      showNotification("Пароль должен содержать минимум 6 символов", {
        type: "error",
      });
      return;
    }
    data.password = password1;
  }

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showNotification("Пользователь успешно обновлён");
      fetchUsers(); // Обновляем пользователей
      resetForm(); // Возвращаем форму в исходное состояние
    } else if (response.status === 404) {
      showNotification("Пользователь не найден.", { type: "error" });
    } else {
      const errorData = await response.json();
      showNotification(
        errorData.error || "Ошибка при обновлении пользователя",
        {
          type: "error",
        }
      );
    }
  } catch (error) {
    console.error("Ошибка сети:", error);
    showNotification("Не удалось подключиться к серверу", { type: "error" });
  }
}

// Делегирование событий для кнопок "Изменить"
document.addEventListener("click", (e) => {
  if (e.target.closest(".btn-edit")) {
    const userId = e.target.closest("button").dataset.userId;
    loadUser(userId);
    enterEditMode();
  }
});
