console.log("Загружен fetch-roles.js");

import { showNotification } from "./utils.js";

// Функция для получения ролей с сервера
async function fetchRoles() {
  try {
    const response = await fetch("/roles");

    // Проверка статуса HTTP‑ответа
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const roles = await response.json();

    // Получаем существующие элементы из DOM
    const form = document.getElementById("editRole");
    const roleSelect = document.getElementById("role"); // Выпадающий список

    // Создаём фрагменты DOM для обоих списков (единый перебор)
    const formFragment = document.createDocumentFragment();
    const selectFragment = document.createDocumentFragment();

    roles.forEach((role) => {
      // Для формы редактирования: создаём div с input
      const roleInput = document.createElement("div");
      roleInput.classList.add("role-input");
      roleInput.innerHTML = `
        <input type="text"
          name="${role.name}"
          data-role-id="${role.id}"
          placeholder="${role.name}">

          <button 
            type="button"
            class="btn btn-role-delete"
            data-role-id="${role.id}"
            title="Удалить"
          >
            <img src="/images/del.png" alt="Удалить">
          </button>
      `;
      formFragment.appendChild(roleInput);

      // Для выпадающего списка: создаём option
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.name;
      selectFragment.appendChild(option);
    });

    // Вставляем готовые фрагменты в существующие DOM‑элементы
    if (form) {
      // Удаляем только input внутри .role-input, сохраняя другие элементы формы
      const roleInputs = form.querySelectorAll(".role-input");
      roleInputs.forEach((inputContainer) => {
        inputContainer.remove();
      });

      // Вставляем новые поля
      //form.appendChild(formFragment);
      form.insertBefore(formFragment, form.firstChild);
    }

    if (roleSelect) {
      roleSelect.innerHTML = ""; // Очищаем список
      roleSelect.appendChild(selectFragment); // Вставляем опции
    }
  } catch (error) {
    console.error("Ошибка при получении списка ролей:", error);
    showNotification(error, { type: "error" });
  }
}

// Экспортируем функцию
export { fetchRoles };
