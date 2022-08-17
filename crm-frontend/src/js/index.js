"use strict";

// Определение элемента CSS-переменных и его стилей
const elemRoot = document.querySelector(":root");
// Объявления общих переменных
let idTimeout;
let inputFilter;
let appTable;
let showLoadingData;
let popupEdit;
let popupDel;
let scrollToId = null;
let elemToScroll = null;

// Инициализация массива студентов
let clients = [];
//   {id: 1, name: 'Иван', surname: 'Иванов', middleName: 'Иванович', dateOfCreation: new Date('2003-07-28'), dateOfChange: new Date('2021-08-06'), contacts: [{type: 'Телефон', value: '+7-928-155-86-26'}]},
//   {id: 2, name: 'Фёдор', surname: 'Петров', middleName: 'Олегович', dateOfCreation: new Date('2001-11-06'), dateOfChange: new Date('2019-11-15'), contacts: [{type: 'Телефон', value: '+7-961-033-15-20'}]},
//   {id: 3, name: 'Пётр', surname: 'Сидоров', middleName: 'Фёдорович', dateOfCreation: new Date('1998-04-12'), dateOfChange: new Date('2018-10-03'), contacts: [{type: 'Телефон', value: '+7-918-008-08-18'}]},
//   {id: 4, name: 'Олег', surname: 'Фёдоров', middleName: 'Петрович', dateOfCreation: new Date('1998-02-05'), dateOfChange: new Date('2016-03-08'), contacts: [{type: 'Телефон', value: '+7-918-928-30-10'}]},
//   {id: 5, name: 'Андрей', surname: 'Григоров', middleName: 'Сидорович', dateOfCreation: new Date('2003-09-14'), dateOfChange: new Date('2020-05-28'), contacts: [{type: 'Телефон', value: '+7-918-988-03-15'}]},
//   {id: 6, name: 'Семён', surname: 'Бурцев', middleName: 'Андреевич', dateOfCreation: new Date('2002-03-21'), dateOfChange: new Date('2019-07-18'), contacts: [{type: 'Телефон', value: '+7-918-988-00-01'}]},
//   {id: 7, name: 'Михаил', surname: 'Брунько', middleName: 'Николаевич', dateOfCreation: new Date('1972-09-30'), dateOfChange: new Date('1989-09-01'), contacts: [{type: 'Телефон', value: '+7-918-018-16-56'}]},
//   {id: 8, name: 'Павел', surname: 'Светлов', middleName: 'Семёнович', dateOfCreation: new Date('2001-10-05'), dateOfChange: new Date('2018-07-18'), contacts: [{type: 'Телефон', value: '+7-928-017-15-18'}]},
//   {id: 9, name: 'Виталий', surname: 'Калиниченко', middleName: 'Викторович', dateOfCreation: new Date('1972-08-26'), dateOfChange: new Date('1989-09-01'),
//    contacts: [{type: 'Телефон', value: '+7-961-533-74-37'},
//               {type: 'Email', value: 'kalinichenkovv@nextmail.ru'},
//               {type: 'Facebook', value: 'facebook.com/kalinichenkovv'},
//               {type: 'VK', value: 'vk.com/id12255'},
//               {type: 'Twitter', value: 'Twitter: @kalinichenkovv.tw'},
//               {type: 'Другое', value: 'Адрес: Россия, Краснодарский край, г.Тихорецк'},
//               {type: 'Другое', value: 'Почтовый индекс: 352129'},
//               {type: 'Другое', value: 'День рождения: 26.08.1972'},
//               {type: 'Другое', value: 'Год выпуска: 1989'},
//               {type: 'Другое', value: 'Год второго выпуска: 2008'}]},
//   {id: 10, name: 'Сергей', surname: 'Глушко', middleName: 'Иванович', dateOfCreation: new Date('1998-04-07'), dateOfChange: new Date('2017-08-19'), contacts: [{type: 'Телефон', value: '+7-918-521-34-56'}]}
// ];
// инициализация массива студентов для показа (сначала он повторяет базовый - clients)
let clientsShow = clients.slice();

/**
 * Функция подготовки даты для отображения в таблице
 */
function dateToTable(date) {
  // "2022-02-21T12:09:05.208Z"
  let str = date.toLocaleString().replace("T", "");
  str = str.slice(0, str.length - 8);
  const strDate = str.slice(0, 10).replace("-", ".").replace("-", ".");
  const strTime = str.slice(10);
  return {
    strDate,
    strTime,
  };
}

/**
 * Функция определения номера колонки заголовка
 */
function getColumnTitle(columnTitle) {
  let numCol = 0;
  if (columnTitle.classList.contains("table__title-column1")) numCol = 1;
  else if (columnTitle.classList.contains("table__title-column2")) numCol = 2;
  else if (columnTitle.classList.contains("table__title-column3")) numCol = 3;
  else if (columnTitle.classList.contains("table__title-column4")) numCol = 4;
  return numCol;
}

/**
 * Функция поиска в таблице клиентов ближайшего к указанному
 */
function findNearIdClient(id) {
  let nextId = null;
  const rowCell = document.querySelectorAll(`.cell-id-${id}`);
  const nextRowCell = rowCell[5].nextSibling;
  if (nextRowCell) nextId = nextRowCell.textContent;
  else {
    const prevRowCell = rowCell[0].previousSibling;
    if (prevRowCell) {
      const posStart = prevRowCell.className.indexOf("cell-id-");
      nextId = prevRowCell.className.slice(posStart + 8);
      const posSpace = nextId.indexOf(" ");
      if (posSpace > -1) nextId = nextId.slice(0, posSpace);
    }
  }
  return nextId;
}

/**
 * Создаём в Header контент и возвращаем форму поиска
 */
function createHeaderContent() {
  const header = document.querySelector(".header");
  // + container
  const container = document.createElement("div");
  container.classList.add("container");
  header.append(container);
  // + div content
  const headerContent = document.createElement("div");
  headerContent.classList.add("flex", "header__content");
  container.append(headerContent);
  // + logo
  const logo = document.createElement("img");
  logo.classList.add("header__logo");
  logo.src = "../img/logo.svg";
  logo.loading = "lazy";
  logo.alt = "Логотип компании Skillbus";
  headerContent.append(logo);
  // + form
  const form = document.createElement("form");
  form.classList.add("flex", "header__form");
  headerContent.append(form);
  // + input
  inputFilter = document.createElement("input");
  inputFilter.classList.add("flex", "header__form-input");
  inputFilter.type = "text";
  inputFilter.size = 53;
  inputFilter.placeholder = "Введите запрос";
  // добавляем обработчика на input фильтра
  inputFilter.addEventListener("input", function () {
    clearTimeout(idTimeout);
    // если была введена строка фильтра и она пустая
    if (!inputFilter.value.trim()) inputFilter.value = "";
    idTimeout = setTimeout(async function () {
      await createClientsShow(true, true);
      showRowsTable();
    }, 300);
  });
  form.append(inputFilter);
}

/**
 * Создаём и возвращаем заголовок приложения
 */
function createAppTitle(title) {
  const elemTitle = document.createElement("h2");
  elemTitle.classList.add("main__title");
  elemTitle.textContent = title;
  return elemTitle;
}

/**
 * Создаём и возвращаем innerHTML заголовок колонки
 */
function createTitleColumn(numColumn, sort) {
  let title = "";
  switch (numColumn) {
    case 1:
      title = "ID";
      break;
    case 2:
      title = "Фамилия Имя Отчество";
      break;
    case 3:
      title = "Дата и время создания";
      break;
    case 4:
      title = "Последние изменения";
      break;
  }
  let textEnd = "";
  if (title === "Фамилия Имя Отчество") {
    if (sort === "sort-up") {
      sort = "sort-down";
      textEnd = "А-Я";
    } else {
      sort = "sort-up";
      textEnd = "Я-А";
    }
  }
  return (
    `<span><span class="table__title-text">${title}</span>
    <span class="table__title-ending">
    <img class="table__title-ending-icon" src="../img/${sort}.svg">` +
    textEnd +
    "</span></span>"
  );
}

/**
 * Создаём и возвращаем innerHTML заголовок колонки
 */
function createHTMLContacts(contact, numContact, allContacts, idClient) {
  let nameIcon = "";
  let typeContact = contact.type + ": ";
  switch (contact.type) {
    case "Телефон":
      nameIcon = "icon-phone";
      break;
    case "Email":
      nameIcon = "icon-mail";
      break;
    case "Facebook":
      nameIcon = "icon-fb";
      break;
    case "VK":
      nameIcon = "icon-vk";
      break;
    case "Другое":
    default:
      nameIcon = "icon-other";
      typeContact = "";
      break;
  }
  const isHidden = allContacts > 5 && numContact > 3;
  const appendClass = isHidden ? ` contact-id-${idClient} is-hidden` : "";
  let strHtml = `<img class="table__cell-icon${appendClass}" src="../img/${nameIcon}.svg"
                  data-tippy-content="${typeContact}${contact.value}">`;
  let moreClass = "";
  if (allContacts > 5 && numContact + 1 === allContacts) {
    moreClass = `more-contact-id-${idClient}`;
    strHtml =
      strHtml +
      `<span class="flex table__cell-icon table__cell-more ${moreClass}"
                          data-tippy-content="Показать больше контактов">+${
                            allContacts - 4
                          }</span>`;
  }
  return {
    strHtml,
    moreClass,
  };
}

/**
 *  Функция создания массива clientsShow
 */
async function createClientsShow(isReload = false, isSearch = false) {
  // Если это полная перезагрузка данных из БД в clients
  if (isReload) {
    // показ индикатора загрузки данных
    showLoadingData.classList.remove("is-hidden");
    // загрузка данных из БД в clients
    let resObj = undefined;
    if (isSearch) {
      resObj = await searchClients(inputFilter.value.trim());
    } else {
      resObj = await loadClients();
    }
    if (resObj.status === 200) {
      clients = resObj.data;
    } else {
      clients = [];
      alert(`Ошибка загрузки списка клиентов:
      код ошибки = ${resObj.status}
      описание ошибки = "${resObj.data.message}"`);
    }
  }
  // берём копию исходного массива
  clientsShow = clients.slice();

  // Сортировка отфильтрованного массива:
  let numColumn = 0;
  const elemColumn = document.querySelector(".is-sort");
  if (elemColumn) {
    // - вычисляем номер колонки для сортировки
    numColumn = getColumnTitle(elemColumn);
    // - определяем порядок сортировки
    const sortDirect = elemColumn.classList.contains("sort-up");
    // - сортируем массив для показа
    switch (numColumn) {
      case 0:
        break;
      case 1:
        if (sortDirect) {
          clientsShow.sort((a, b) => a.id - b.id);
        } else {
          clientsShow.sort((a, b) => b.id - a.id);
        }
        break;
      case 2:
        if (sortDirect) {
          clientsShow.sort(function (a, b) {
            if (
              (a.surname + a.name + a.middleName).toUpperCase() >
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return 1;
            if (
              (a.surname + a.name + a.middleName).toUpperCase() ===
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return 0;
            if (
              (a.surname + a.name + a.middleName).toUpperCase() <
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return -1;
          });
        } else {
          clientsShow.sort(function (a, b) {
            if (
              (a.surname + a.name + a.middleName).toUpperCase() <
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return 1;
            if (
              (a.surname + a.name + a.middleName).toUpperCase() ===
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return 0;
            if (
              (a.surname + a.name + a.middleName).toUpperCase() >
              (b.surname + b.name + b.middleName).toUpperCase()
            )
              return -1;
          });
        }
        break;
      case 3:
        if (sortDirect) {
          clientsShow.sort(function (a, b) {
            if (a.dateOfCreation > b.dateOfCreation) return 1;
            if (a.dateOfCreation === b.dateOfCreation) return 0;
            if (a.dateOfCreation < b.dateOfCreation) return -1;
          });
        } else {
          clientsShow.sort(function (a, b) {
            if (a.dateOfCreation < b.dateOfCreation) return 1;
            if (a.dateOfCreation === b.dateOfCreation) return 0;
            if (a.dateOfCreation > b.dateOfCreation) return -1;
          });
        }
        break;
      case 4:
        if (sortDirect) {
          clientsShow.sort(function (a, b) {
            if (a.dateOfChange > b.dateOfChange) return 1;
            if (a.dateOfChange === b.dateOfChange) return 0;
            if (a.dateOfChange < b.dateOfChange) return -1;
          });
        } else {
          clientsShow.sort(function (a, b) {
            if (a.dateOfChange < b.dateOfChange) return 1;
            if (a.dateOfChange === b.dateOfChange) return 0;
            if (a.dateOfChange > b.dateOfChange) return -1;
          });
        }
        break;
    }
  }
}

/**
 *  Функция обработчика для заголовка колонки таблицы клиентов
 */
function eventHandlerColumnTitle(columnTitle) {
  columnTitle.addEventListener("click", async function () {
    // если признак сортировки для данной колонки установлен
    if (columnTitle.classList.contains("is-sort")) {
      // меняем сортировку по данной колонке
      if (columnTitle.classList.contains("sort-up")) {
        columnTitle.classList.remove("sort-up");
        columnTitle.classList.add("sort-down");
        columnTitle.innerHTML = createTitleColumn(
          getColumnTitle(columnTitle),
          "sort-down"
        );
      } else if (columnTitle.classList.contains("sort-down")) {
        columnTitle.classList.remove("sort-down");
        columnTitle.classList.remove("is-sort");
        columnTitle.innerHTML = createTitleColumn(
          getColumnTitle(columnTitle),
          "sort-up"
        );
      }
    } else {
      // удаляем сортировки по всем колонкам
      document.querySelectorAll(".is-sort").forEach(function (el) {
        el.classList.remove("is-sort");
        el.classList.remove("sort-up");
        el.classList.remove("sort-down");
        el.innerHTML = createTitleColumn(getColumnTitle(el), "sort-up");
      });
      // устанавливаем сортировку по данной колонке
      columnTitle.classList.add("is-sort");
      columnTitle.classList.add("sort-up");
      columnTitle.innerHTML = createTitleColumn(
        getColumnTitle(columnTitle),
        "sort-up"
      );
    }
    await createClientsShow(true);
    showRowsTable();
  });
}

/**
 * Создаём и показываем строки таблицы клиентов
 */
function showRowsTable() {
  // удаляем из DOM уже созданные ранее строки таблицы студентов
  document.querySelectorAll(".table__cell").forEach(function (cell) {
    cell.remove();
  });
  // считаем количество строк таблицы и записываем в переменную CSS
  elemRoot.style.setProperty("--count-line-table", clientsShow.length);
  // создаём строки таблицы
  clientsShow.forEach(function (client) {
    // ID студента
    const elemCell1 = document.createElement("div");
    elemCell1.classList.add(
      "flex",
      "table__cell",
      "cell-1",
      `cell-id-${client.id}`
    );
    elemCell1.innerHTML = `<a class="table__cell-link" href="client.html?ClientId=${client.id}" target="_blank"
                           data-tippy-content="Карточку клиента">${client.id}</a>`;
    const elemCell1Link = elemCell1.querySelector(".table__cell-link");
    createTooltip(elemCell1Link);
    appTable.append(elemCell1);
    // - определение элемента, который нужно показать после заполнения таблицы
    if (scrollToId) {
      if (client.id === scrollToId) elemToScroll = elemCell1;
    }
    // ФИО студента
    const elemCell2 = document.createElement("div");
    elemCell2.classList.add(
      "flex",
      "table__cell",
      "cell-2",
      `cell-id-${client.id}`
    );
    elemCell2.textContent =
      client.surname + " " + client.name + " " + client.middleName;
    appTable.append(elemCell2);
    // Дата и время создания записи
    const elemCell3 = document.createElement("div");
    elemCell3.classList.add(
      "flex",
      "table__cell",
      "cell-3",
      `cell-id-${client.id}`
    );
    let objDate = dateToTable(client.createdAt);
    elemCell3.innerHTML = `${objDate.strDate}&emsp;<span class="table__cell-grey">${objDate.strTime}</span>`;
    appTable.append(elemCell3);
    // Дата и время изменения записи
    const elemCell4 = document.createElement("div");
    elemCell4.classList.add(
      "flex",
      "table__cell",
      "cell-4",
      `cell-id-${client.id}`
    );
    objDate = dateToTable(client.updatedAt);
    elemCell4.innerHTML = `${objDate.strDate}&emsp;<span class="table__cell-grey">${objDate.strTime}</span>`;
    appTable.append(elemCell4);
    // Контакты
    const elemCell5 = document.createElement("div");
    elemCell5.classList.add(
      "flex",
      "table__cell",
      "cell-5",
      `cell-id-${client.id}`
    );
    let textHTML = "";
    let classMore = "";
    // - создаём иконки-элементы имеющихся контактов
    for (let j = 0; j < client.contacts.length; j++) {
      const contact = client.contacts[j];
      const objText = createHTMLContacts(
        contact,
        j,
        client.contacts.length,
        client.id
      );
      textHTML = textHTML + objText.strHtml;
      if (objText.moreClass) classMore = `.${objText.moreClass}`;
    }
    elemCell5.innerHTML = textHTML;
    appTable.append(elemCell5);
    // -- создаём обработчик для иконки показа дополнительных контактов
    if (classMore) {
      const iconMore = document.querySelector(classMore);
      iconMore.addEventListener("click", function () {
        iconMore.classList.add("is-hidden");
        document
          .querySelectorAll(`.contact-id-${client.id}`)
          .forEach((el) => el.classList.remove("is-hidden"));
      });
    }
    // Действия
    const elemCell6 = document.createElement("div");
    elemCell6.classList.add(
      "flex",
      "table__cell",
      "cell-6",
      `cell-id-${client.id}`
    );
    // - создаём кнопку изменения клиента
    const buttonChange = document.createElement("button");
    buttonChange.classList.add(
      "flex",
      "btn",
      "btn__change",
      `btn__change-id-${client.id}`
    );
    buttonChange.innerHTML = `<span class="btn__change-text" data-tippy-content="Изменить контакт">
                              <img class="btn__change-text-icon" src="../img/icon-edit.svg">
                              Изменить</span>`;
    elemCell6.append(buttonChange);
    // -- создаём обработчик для кнопки изменения клиента
    buttonChange.addEventListener("click", function () {
      this.querySelector(".btn__change-text-icon").setAttribute(
        "src",
        "../img/icon-wait.svg"
      );

      openPopupEdit("edit", client.id);
    });
    // - создаём кнопку удаления клиента
    const buttonDelete = document.createElement("button");
    buttonDelete.classList.add(
      "flex",
      "btn",
      "btn__delete",
      `btn__delete-id-${client.id}`
    );
    buttonDelete.innerHTML = `<span class="btn__delete-text" data-tippy-content="Удалить контакт">
                              <img class="btn__delete-text-icon" src="../img/icon-del.svg">
                              Удалить</span>`;
    elemCell6.append(buttonDelete);
    // -- создаём обработчик для кнопки удаления клиента
    buttonDelete.addEventListener("click", function () {
      this.querySelector(".btn__delete-text-icon").setAttribute(
        "src",
        "../img/icon-waitdel.svg"
      );
      openPopupDel(client.id);
    });
    appTable.append(elemCell6);
  });
  // если строк в таблице нет, то записываем 1 в переменную CSS
  if (clientsShow.length === 0)
    elemRoot.style.setProperty("--count-line-table", 1);
  // создаём всплывающие подсказки на иконках и кнопках
  createTooltips();
  // прокрутка к целевому элементу, который нужно показать
  if (elemToScroll) {
    elemToScroll.scrollIntoView({ block: "center", inline: "center" });
  }
  scrollToId = null;
  elemToScroll = null;
  // снятие индикатора загрузки данных
  showLoadingData.classList.add("is-hidden");
}

/**
 * Создаём и возвращаем таблицу приложения
 */
function createAppTable() {
  // Создаём таблицу
  const appTable = document.createElement("div");
  appTable.classList.add("table");
  // Создаём 1 колонку заголовка таблицы
  const titleColumn1 = document.createElement("div");
  titleColumn1.classList.add(
    "flex",
    "table__title",
    "table__title-column1",
    "is-sort",
    "sort-up"
  );
  titleColumn1.innerHTML = createTitleColumn(1, "sort-up");
  titleColumn1.title =
    "Кликните на заголовок колонки для сортировки/отмены по этому полю";
  // - добавляем обработчика на заголовок колонки
  eventHandlerColumnTitle(titleColumn1);
  appTable.append(titleColumn1);
  // Создаём 2 колонку заголовка таблицы
  const titleColumn2 = document.createElement("div");
  titleColumn2.classList.add("flex", "table__title", "table__title-column2");
  titleColumn2.innerHTML = createTitleColumn(2, "sort-up");
  titleColumn2.title =
    "Кликните на заголовок колонки для сортировки/отмены по этому полю";
  // - добавляем обработчика на заголовок колонки
  eventHandlerColumnTitle(titleColumn2);
  appTable.append(titleColumn2);
  // Создаём 3 колонку заголовка таблицы
  const titleColumn3 = document.createElement("div");
  titleColumn3.classList.add("flex", "table__title", "table__title-column3");
  titleColumn3.innerHTML = createTitleColumn(3, "sort-up");
  titleColumn3.title =
    "Кликните на заголовок колонки для сортировки/отмены по этому полю";
  // - добавляем обработчика на заголовок колонки
  eventHandlerColumnTitle(titleColumn3);
  appTable.append(titleColumn3);
  // Создаём 4 колонку заголовка таблицы
  const titleColumn4 = document.createElement("div");
  titleColumn4.classList.add("flex", "table__title", "table__title-column4");
  titleColumn4.innerHTML = createTitleColumn(4, "sort-up");
  titleColumn4.title =
    "Кликните на заголовок колонки для сортировки/отмены по этому полю";
  // - добавляем обработчика на заголовок колонки
  eventHandlerColumnTitle(titleColumn4);
  appTable.append(titleColumn4);
  // Создаём 5 колонку заголовка таблицы
  const titleColumn5 = document.createElement("div");
  titleColumn5.classList.add("flex", "table__title");
  titleColumn5.textContent = "Контакты";
  appTable.append(titleColumn5);
  // Создаём 6 колонку заголовка таблицы
  const titleColumn6 = document.createElement("div");
  titleColumn6.classList.add("flex", "table__title");
  titleColumn6.textContent = "Действия";
  appTable.append(titleColumn6);
  return {
    appTable,
    titleColumn1,
    titleColumn2,
    titleColumn3,
    titleColumn4,
  };
}

/**
 * Создаём и возвращаем кнопку добавления нового клиента
 */
function createBtnNew(text) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn__empty");
  button.innerHTML = `<span class="btn__empty-content">
  <svg class="btn__empty-content-icon" width="23" height="16" viewbox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z" fill="#9873FF"/>
  </svg>
  ${text}</span>`;
  button.title = "Добавить нового клиента";
  return button;
}

/**
 * Создаём в Main контент и возвращаем
 */
function createrMainContent() {
  const main = document.querySelector(".main");
  // + containerTitle
  const containerTitle = document.createElement("div");
  containerTitle.classList.add("container");
  main.append(containerTitle);
  // + title
  const appTitle = createAppTitle("Клиенты");
  containerTitle.append(appTitle);
  // + wrapper for table
  const mainWrapper = document.createElement("div");
  mainWrapper.classList.add("main-wrapper");
  main.append(mainWrapper);
  // + content for wrapper
  const mainContent = document.createElement("div");
  mainContent.classList.add("main-content");
  mainWrapper.append(mainContent);
  // + indication loading for content
  showLoadingData = document.createElement("div");
  showLoadingData.classList.add("main-content-loading", "is-hidden");
  mainContent.append(showLoadingData);
  // + table
  const bodyMain = createAppTable();
  mainContent.append(bodyMain.appTable);
  // + containerButton
  const containerButton = document.createElement("div");
  containerButton.classList.add("flex", "container");
  main.append(containerButton);
  // + button
  const appBtnNew = createBtnNew("Добавить клиента");
  appBtnNew.addEventListener("click", function () {
    openPopupEdit("new");
  });
  containerButton.append(appBtnNew);
  return bodyMain;
}

/* --------------------------------------------------------------------------------------------------------------------*/

/**
 * Когда страница загружена
 */
document.addEventListener("DOMContentLoaded", async function () {
  // создаём заголовок с формой поиска
  createHeaderContent();

  /* Создаём основное тело страницы */
  const bodyMain = createrMainContent();
  appTable = bodyMain.appTable;

  // отображаем таблицу клиентов
  await createClientsShow(true);
  showRowsTable(appTable);

  // создаём тело модальных окон
  popupEdit = createPopupEdit();
  popupDel = createPopupDel();
});
