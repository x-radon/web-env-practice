console.log("Загружен utils.js");

// Функция для отображения сообщений

/*

Как использовать

// Простое уведомление
showNotification('Операция выполнена!');

// С указанием типа
showNotification('Ошибка!', { type: 'error' });
showNotification('Внимание!', { type: 'warning' });

// Другое время показа
showNotification('Сохранено', { duration: 5000 }); // 5 секунд

//Другая позиция
showNotification('Сообщение', { position: 'bottom-right' });

// С кнопкой закрытия
showNotification('Нажмите × для закрытия', { closeButton: true });

//С callback-ами
showNotification('Готово!', {
  onShow: (el) => console.log('Показано', el),
  onClose: (el) => console.log('Закрыто', el)
});

// В конкретный контейнер
const container = document.getElementById('notifications');
showNotification('В моём контейнере', { container: container });

*/

function showNotification(message, options = {}) {
  const defaultOptions = {
    type: "success",
    duration: 3000,
    position: "top-center",
    container: document.body,
    className: "",
    closeButton: false,
    onShow: null,
    onClose: null,
  };

  const settings = { ...defaultOptions, ...options };

  if (!(settings.container instanceof Node)) {
    console.error("Контейнер не является валидным DOM-узлом");
    return;
  }

  const notification = document.createElement("div");

  // Фильтруем классы
  const classes = [
    "notification",
    `notification--${settings.type}`,
    settings.position,
    settings.className,
  ].filter(Boolean);

  notification.classList.add(...classes);
  notification.textContent = message;

  if (settings.closeButton) {
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("notification__close");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => {
      closeNotification(notification, settings, closeTimeout);
    });
    notification.appendChild(closeBtn);
  }

  settings.container.appendChild(notification);

  if (typeof settings.onShow === "function") {
    settings.onShow(notification);
  }

  const closeTimeout = setTimeout(() => {
    closeNotification(notification, settings, closeTimeout);
  }, settings.duration);

  return notification;
}

function closeNotification(element, settings, timeoutId) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  element.remove();

  if (typeof settings.onClose === "function") {
    settings.onClose(element);
  }
}

export { showNotification };
