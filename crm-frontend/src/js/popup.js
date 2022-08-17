'use strict';

// Получение элемента body для блоки рования его скролла
const elemBody = document.querySelector('body');
// Переменные исключения двойного нажатия
let unlock = true; // признак наличия блокировки скролла у body
const timeoutTransition = 800; // таймаут анимаций в мс, должен соответствовать времени анимации в transition из popup.css
//
let modeEdit = null;
let currIdEdit = null;
let currIdDel = null;
let popupLevel = 0;

/**
 * Функция блокировки скролла body
*/
function bodyLock() {
  if (popupLevel === 0) elemBody.classList.add('popup-lock'); // блокировка скролла у body
  popupLevel++;
  // Исключение повторных нажатий на время появления popup
  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeoutTransition);
};

/**
 * Функция разблокировки скролла у body
*/
function bodyUnlock() {
  setTimeout(function () {
    if (popupLevel === 0) elemBody.classList.remove('popup-lock'); // снятие блокировки скролла у body
  }, timeoutTransition);
  // Исключение повторных нажатий на время сворачивания popup
  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeoutTransition);
};

/**
 * Функция Закрытия popup
 */
function closePopup(elemPopup = popupEdit, namePopup, forceClose = false) {
  // если закончилась анимация открытия popup
  if (unlock || forceClose) {
    // если есть уже открытый popup
    if (popupLevel > 0) {
      if (namePopup === 'edit') {
        if (currIdEdit) {
          const rowCell = document.querySelectorAll(`.cell-id-${currIdEdit}`);
          rowCell[5].querySelector('.btn__change-text-icon').setAttribute('src', '../img/icon-edit.svg');
          currIdEdit = null;
        }
        modeEdit = null;
      }
      else if (namePopup === 'del') {
        const rowCell = document.querySelectorAll(`.cell-id-${currIdDel}`);
        rowCell[5].querySelector('.btn__delete-text-icon').setAttribute('src', '../img/icon-del.svg');
        currIdDel = null;
      }
      elemPopup.classList.remove('open');
      popupLevel--;
      bodyUnlock(); // разблокируем скролл у body
    }
  }
};

/**
 * Функция проверки поля ввода на наличие недопустимых символов в ФИО
*/
function checkOnBadChar(inStr) {
  const SPACE = 32;
  const engCharA = {min: 65, max: 90};
  const engChara = {min: 97, max: 122};
  const ruCharA = {min: 1040, max: 1130};
  const ruCharYo = {big: 1025, small: 1105};
  let isBadChar = false;
  // для каждого символа строки
  for (let i = 0; i < inStr.length; i++) {
    const cod = inStr.charCodeAt(i);
    isBadChar = !((cod === SPACE || (engCharA.min <= cod && cod <= engCharA.max) || (engChara.min <= cod && cod <= engChara.max) || (ruCharA.min <= cod && cod <= ruCharA.max) || cod === ruCharYo.big || cod === ruCharYo.small));
    if (isBadChar) break;
  };
  return isBadChar;
};

/**
 * Функция получения последнего номера id в списке контактов и вычислениен следующего номера
*/
function nextIdForConstacts(groupContacts) {
  let strCount = '0';
  if (groupContacts.childElementCount > 0) {
    const labelTypeLastContact = groupContacts.lastElementChild.firstElementChild;
    if (labelTypeLastContact) {
      strCount = labelTypeLastContact.getAttribute('for').slice(-1);
      strCount = (parseInt(strCount) + 1).toString();
    }
  }
  return strCount;
};

/**
 * Функция проверки наличия контактов в списке контактов и внесение изменений в DOM
*/
function checkExistContacts() {
  const countContacts = popupEdit.groupContacts.childElementCount;
  if (countContacts > 0) {
    popupEdit.groupContacts.classList.remove('is-hidden');
    popupEdit.wraperBtnNewContact.classList.add('is-exist-contacts');
    if (countContacts < 10) popupEdit.wraperBtnNewContact.classList.remove('is-hidden');
    else popupEdit.wraperBtnNewContact.classList.add('is-hidden');
  } else {
    popupEdit.groupContacts.classList.add('is-hidden');
    popupEdit.wraperBtnNewContact.classList.remove('is-exist-contacts');
  }
};

/**
 * Функция обработчика для полей ввода ФИО
*/
function eventHandlerPreValidateField(inLabel, inInput) {
  const elemLabelText = inLabel.querySelector('.popup__form-label-text');
  if (inInput.value.trim().length > 0) {
    elemLabelText.classList.remove('as-placeholder');
  }
  else {
    elemLabelText.classList.add('as-placeholder');
  }
  if (checkOnBadChar(inInput.value.trim())) inLabel.classList.add('is-error');
  else inLabel.classList.remove('is-error');
};

/**
 * Функция обработчика для select типа контакта
*/
function eventHandlerChangeTypeContact(inSelect, inInput, inError, inBtn) {
  // проверка на изменение типа контакта
  const oldValue = inSelect.getAttribute('old-value');
  if (inSelect.value !== oldValue) {
    // обработка контакта
    if (oldValue !== 'empty') inInput.value = '';
    inError.textContent = '';
    inError.classList.add('is-hidden');
    // задание/снятие маски ввода в зависимости от типа
    if (inSelect.value === 'Телефон') {
      inInput.type = 'tel';
      inSelect.setAttribute('old-value', 'Телефон');
    } else if (inSelect.value === 'Email') {
      inInput.type = 'text';
      inSelect.setAttribute('old-value', 'Email');
    } else if (inSelect.value === 'Facebook') {
      inInput.type = 'text';
      inSelect.setAttribute('old-value', 'Facebook');
    } else if (inSelect.value === 'VK') {
      inInput.type = 'text';
      inSelect.setAttribute('old-value', 'VK');
    } else if (inSelect.value === 'Другое') {
      inInput.type = 'text';
      inSelect.setAttribute('old-value', 'Другое');
    }
    // вызов валидации поля ввода контакта после изменения типа поля
    eventHandlerValidateContact(inSelect, inInput, inError, inBtn);
  }
};

/**
 * Функция обработчика для поля ввода контакта
*/
function eventHandlerValidateContact(inSelect, inInput, inError, inBtn, isShowError = false) {
  let isValid = false;
  let isShowBtn = false;
  let inValueStr = inInput.value;
  let valueShow = '';
  // валидация контакта - Телефон
  if (inSelect.value === 'Телефон') {
    const regexpTel = /^\+[\d]{1}\ \([\d]{3}\)\ [\d]{3}-[\d]{2}-[\d]{2}$/; // "+7 (999) 999-99-99"
    inValueStr = inValueStr.trim();
    if (inValueStr) {
      if (inValueStr.slice(0, 3) !== '+7 ') inValueStr = '+7 ' + inValueStr;
      const strVal = inValueStr.replace(/\D/g, "");
      const codCountry = strVal.slice(0, 1);
      const codRegion = strVal.slice(1, 4);
      const numPart1 = strVal.slice(4, 7);
      const numPart2 = strVal.slice(7, 9);
      const numPart3 = strVal.slice(9, 11);
      if (codRegion) {
        valueShow = `+${codCountry} (${codRegion}`;
        if (codRegion.length === 3) {
          if (numPart1) {
            valueShow = valueShow + `) ${numPart1}`;
            if (numPart1.length === 3) {
              if (numPart2) {
                valueShow = valueShow + `-${numPart2}`;
                if (numPart2.length === 2) if (numPart3) valueShow = valueShow + `-${numPart3}`;
              }
            }
          }
        }
      }
    }
    // если есть введённые цифры
    if (valueShow) {
      isShowBtn = true;
      if (valueShow.length < 18) inError.textContent = 'Заполните номер до конца';
      else inError.textContent = '';
    } else inError.textContent = 'Укажите телефонный номер';
    inInput.value = valueShow;
    isValid = regexpTel.test(valueShow);
  }
  // валидация контакта - Email
  else if (inSelect.value === 'Email') {
    const regexpMail = /^[A-Za-z0-9_\-\.]+\@[A-Za-z0-9_\-\.]+\.[A-Za-z]{2,4}$/;
    inValueStr = inValueStr.trim();
    if (inValueStr) valueShow = inValueStr;
    // если есть введённые символы
    if (valueShow) isShowBtn = true;
    else inError.textContent = 'Укажите e-mail';
    inInput.value = valueShow;
    isValid = regexpMail.test(valueShow);
    if (isValid) inError.textContent = 'Укажите верный e-mail';
  }
  // валидация контакта - Facebook
  else if (inSelect.value === 'Facebook') {
    inValueStr = inValueStr.trim();
    if (inValueStr) {
      let nameContact;
      if (inValueStr.slice(0, 13) === 'facebook.com/') nameContact = inValueStr.slice(13).trim();
      else nameContact = inValueStr;
      if (nameContact) valueShow = `facebook.com/${nameContact}`;
    }
    // если есть введённые символы
    if (valueShow) {
      isShowBtn = true;
      if (valueShow.length < 14) inError.textContent = 'Укажите контакт facebook';
      else {
        inError.textContent = '';
        isValid = true;
      }
    } else inError.textContent = 'Укажите контакт facebook';
    inInput.value = valueShow;
  }
  // валидация контакта - VK
  else if (inSelect.value === 'VK') {
    inValueStr = inValueStr.trim();
    if (inValueStr) {
      let nameContact;
      if (inValueStr.slice(0, 7) === 'vk.com/') nameContact = inValueStr.slice(7).trim();
      else nameContact = inValueStr;
      if (nameContact) valueShow = `vk.com/${nameContact}`;
    }
    // если есть введённые символы
    if (valueShow) {
      isShowBtn = true;
      if (valueShow.length < 8) inError.textContent = 'Укажите контакт VK';
      else {
        inError.textContent = '';
        isValid = true;
      }
    } else inError.textContent = 'Укажите контакт VK';
    inInput.value = valueShow;
  }
  // валидация контакта - Другое
  else if (inSelect.value === 'Другое') {
    // если есть введённые символы
    if (inValueStr) {
      isShowBtn = true;
      isValid = true;
    }
    else inError.textContent = 'Укажите данные контакта';
    inInput.value = inValueStr;
  }
  // показать/скрыть кнопку удаления контакта
  if (isShowBtn) inBtn.classList.remove('is-hidden');
  else {
    inInput.value = '';
    if (inBtn) inBtn.classList.add('is-hidden');
  }
  // показать/скрыть контекстное сообщение об ошибке
  if (isShowError && !isValid) inError.classList.remove('is-hidden');
  else {
    inError.textContent = '';
    inError.classList.add('is-hidden');
  }

  return isValid;
};

/**
 * Создаём и возвращем поле вывода ошибки записи/удаления клиента
 */
function createFieldMessageError() {
  const elemFieldMessageError = document.createElement('p');
  elemFieldMessageError.classList.add('popup__field-error');
  return elemFieldMessageError;
};

/**
 * Очищаем поле вывода ошибки записи/удаления клиента
 */
function closeFieldMessageError(field) {
  field.classList.remove('is-error');
  field.innerHTML = '';
};

/**
 * Очищаем поле вывода ошибки записи/удаления клиента
 */
function showFieldMessageError(field, resObj) {
  field.innerHTML =  `Ошибка: код ошибки = ${resObj.status},<br>
                      описание ошибки = "${resObj.data.message}"`;
  field.classList.add('is-error');
};

/**
 * Создаём модальную форму создания/изменения клиента
 * и возвращаем объект с элементами формы
*/
function createPopupEdit() {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.style.zIndex = 100;
  elemBody.append(popup);
  const elemPlaceCenterY = document.createElement('div');
  elemPlaceCenterY.classList.add('flex', 'popup__place-center-Y');
  popup.append(elemPlaceCenterY);
  const elemContent = document.createElement('div');
  elemContent.classList.add('flex', 'flex-column', 'popup__content');
  elemPlaceCenterY.append(elemContent);
  // индикация ожидания работы с данными
  const showWaitPopup = document.createElement('div');
  showWaitPopup.classList.add('popup__content-wait', 'is-hidden');
  showWaitPopup.style.zIndex = 102;
  elemContent.append(showWaitPopup);
  // создаём кнопку закрытия модального окна
  const elemBtnClose = document.createElement('button');
  elemBtnClose.classList.add('btn', 'popup__btn-close');
  elemBtnClose.innerHTML = '<img class="popup__btn-close-icon" src="../img/icon-close.svg"></img>';
  elemBtnClose.style.zIndex = 101;
  // + обработчик закрытия popup по клику
  elemBtnClose.addEventListener('click', function() {closePopup(popup, 'edit')});
  elemContent.append(elemBtnClose);
  // создаём заголовок окна
  const popupTitle = document.createElement('h3');
  popupTitle.classList.add('popup__title', 'popup__content-edit');
  popupTitle.innerHTML = 'Новый клиент';
  elemContent.append(popupTitle);
  // создаём форму данных клиента
  const popupForm = document.createElement('form');
  popupForm.classList.add('popup__form');
  // + обработчик отправки формы
  popupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    eventHandlerValidateForm();
  });
  elemContent.append(popupForm);
  // создаём обёртку для полей ввод
  const groupFields = document.createElement('div');
  groupFields.classList.add('popup__group-fields', 'popup__content-edit');
  popupForm.append(groupFields);
  // создаём inputSurname
  const labelSurname = document.createElement('label');
  labelSurname.classList.add('popup__form-label');
  labelSurname.innerHTML = `<span class="popup__form-label-text">Фамилия<span class="popup__form-label-text-end">*</span></span>`;
  groupFields.append(labelSurname);
  const inputSurname = document.createElement('input');
  inputSurname.classList.add('popup__form-input');
  inputSurname.type = 'text';
  labelSurname.append(inputSurname);
  // + обработчик на поле ввода inputSurname
  inputSurname.addEventListener('input', function() {
    eventHandlerPreValidateField(labelSurname, inputSurname);
    if (inputSurname.value.trim().length > 1) inputSurnameError.classList.add('is-hidden');
  });
  // + inputSurnameError
  const inputSurnameError = document.createElement('div');
  inputSurnameError.classList.add('popup__form-input-error', 'is-hidden');
  inputSurnameError.textContent = 'Должно быть не менее 2 букв';
  labelSurname.append(inputSurnameError);
  // создаём inputName
  const labelName = document.createElement('label');
  labelName.classList.add('popup__form-label');
  labelName.innerHTML = `<span class="popup__form-label-text">Имя<span class="popup__form-label-text-end">*</span></span>`;
  groupFields.append(labelName);
  const inputName = document.createElement('input');
  inputName.classList.add('popup__form-input');
  inputName.type = 'text';
  labelName.append(inputName);
  // + обработчик на поле ввода inputName
  inputName.addEventListener('input', function() {
    eventHandlerPreValidateField(labelName, inputName);
    if (inputName.value.trim().length > 1) inputNameError.classList.add('is-hidden');
  });
  // + inputNameError
  const inputNameError = document.createElement('div');
  inputNameError.classList.add('popup__form-input-error', 'is-hidden');
  inputNameError.textContent = 'Должно быть не менее 2 букв';
  labelName.append(inputNameError);
  // создаём inputMiddleName
  const labelMiddleName = document.createElement('label');
  labelMiddleName.classList.add('popup__form-label');
  labelMiddleName.innerHTML = '<span class="popup__form-label-text">Отчество</span>';
  groupFields.append(labelMiddleName);
  const inputMiddleName = document.createElement('input');
  inputMiddleName.classList.add('popup__form-input');
  inputMiddleName.type = 'text';
  labelMiddleName.append(inputMiddleName);
  // + обработчик на поле ввода inputMiddleName
  labelMiddleName.addEventListener('input', function() {
    eventHandlerPreValidateField(labelMiddleName, inputMiddleName);
    if (inputMiddleName.value.trim().length > 1) inputMiddleNameError.classList.add('is-hidden');
  });
  // + inputMiddleNameError
  const inputMiddleNameError = document.createElement('div');
  inputMiddleNameError.classList.add('popup__form-input-error', 'is-hidden');
  inputMiddleNameError.textContent = 'Должно быть не менее 2 букв';
  labelMiddleName.append(inputMiddleNameError);
  // создаём обёртку для контактов
  const groupContacts = document.createElement('div');
  groupContacts.classList.add('popup__group-contacts', 'popup__content-edit');
  popupForm.append(groupContacts);
  // создаём обёртку для кнопки добавления контакта
  const wraperBtnNewContact = document.createElement('div');
  wraperBtnNewContact.classList.add('flex', 'flex-column', 'popup__wraper-btn-new');
  popupForm.append(wraperBtnNewContact);
  // создаём кнопку добавления контакта
  const buttonNewContact = document.createElement('button');
  buttonNewContact.classList.add('btn', 'btn__newcont');
  buttonNewContact.type = 'button';
  buttonNewContact.innerHTML = `<span class="btn__newcont-text">
                                <svg class="btn__newcont-text-icon icon-normal" width="16" height="16" viewbox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.99998 4.66683C7.63331 4.66683 7.33331 4.96683 7.33331 5.3335V7.3335H5.33331C4.96665 7.3335 4.66665 7.6335 4.66665 8.00016C4.66665 8.36683 4.96665 8.66683 5.33331 8.66683H7.33331V10.6668C7.33331 11.0335 7.63331 11.3335 7.99998 11.3335C8.36665 11.3335 8.66665 11.0335 8.66665 10.6668V8.66683H10.6666C11.0333 8.66683 11.3333 8.36683 11.3333 8.00016C11.3333 7.6335 11.0333 7.3335 10.6666 7.3335H8.66665V5.3335C8.66665 4.96683 8.36665 4.66683 7.99998 4.66683ZM7.99998 1.3335C4.31998 1.3335 1.33331 4.32016 1.33331 8.00016C1.33331 11.6802 4.31998 14.6668 7.99998 14.6668C11.68 14.6668 14.6666 11.6802 14.6666 8.00016C14.6666 4.32016 11.68 1.3335 7.99998 1.3335ZM7.99998 13.3335C5.05998 13.3335 2.66665 10.9402 2.66665 8.00016C2.66665 5.06016 5.05998 2.66683 7.99998 2.66683C10.94 2.66683 13.3333 5.06016 13.3333 8.00016C13.3333 10.9402 10.94 13.3335 7.99998 13.3335Z" fill="#9873FF"/>
                                </svg>
                                <svg class="btn__newcont-text-icon icon-hover" width="14" height="14" viewbox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0.333313 7.00016C0.333313 3.32016 3.31998 0.333496 6.99998 0.333496C10.68 0.333496 13.6666 3.32016 13.6666 7.00016C13.6666 10.6802 10.68 13.6668 6.99998 13.6668C3.31998 13.6668 0.333313 10.6802 0.333313 7.00016ZM6.33329 4.33366C6.33329 3.96699 6.63329 3.66699 6.99996 3.66699C7.36663 3.66699 7.66663 3.96699 7.66663 4.33366V6.33366H9.66663C10.0333 6.33366 10.3333 6.63366 10.3333 7.00033C10.3333 7.36699 10.0333 7.66699 9.66663 7.66699H7.66663V9.66699C7.66663 10.0337 7.36663 10.3337 6.99996 10.3337C6.63329 10.3337 6.33329 10.0337 6.33329 9.66699V7.66699H4.33329C3.96663 7.66699 3.66663 7.36699 3.66663 7.00033C3.66663 6.63366 3.96663 6.33366 4.33329 6.33366H6.33329V4.33366Z" fill="#9873FF"/>
                                </svg>
                                Добавить контакт</span>`;
  // + обработчик кнопки добавления контакта
  buttonNewContact.addEventListener('click', function() {
    const elemContactObj = createElemContact(nextIdForConstacts(groupContacts), {type: 'Телефон', value: ''});
    groupContacts.append(elemContactObj.wrapperContact);
    checkExistContacts();
  });
  wraperBtnNewContact.append(buttonNewContact);
  // создаём обёртку для поля вывода ошибки записи клиента
  const wraperFieldMessageError = document.createElement('div');
  wraperFieldMessageError.classList.add('flex', 'flex-column', 'popup__wraper-field-error');
  popupForm.append(wraperFieldMessageError);
  // создаём поле вывода ошибки записи клиента
  const fieldMessageErrorEdit = createFieldMessageError();
  wraperFieldMessageError.append(fieldMessageErrorEdit);
  // создаём обёртку для кнопки сохранения клиента
  const wraperBtnSaveClient = document.createElement('div');
  wraperBtnSaveClient.classList.add('flex', 'flex-column', 'popup__wraper-btn-save');
  popupForm.append(wraperBtnSaveClient);
  // создаём кнопку сохранения клиента
  const buttonSaveClient = document.createElement('button');
  buttonSaveClient.classList.add('btn', 'btn__fill');
  buttonSaveClient.type = 'submit';
  buttonSaveClient.textContent = 'Сохранить';
  wraperBtnSaveClient.append(buttonSaveClient);
  // создаём кнопку отмены сохранения клиента
  const buttonCancel = document.createElement('button');
  buttonCancel.classList.add('btn', 'btn__underline');
  buttonCancel.textContent = 'Отмена';
  // + обработчик закрытия popup по клику
  buttonCancel.addEventListener('click', function() {closePopup(popup, 'edit')});
  elemContent.append(buttonCancel);
  // создаём кнопку удаления клиента
  const buttonDelete = document.createElement('button');
  buttonDelete.classList.add('btn', 'btn__underline');
  buttonDelete.textContent = 'Удалить клиента';
  // + обработчик открытия popupDel по клику
  buttonDelete.addEventListener('click', function() {openPopupDel(currIdEdit)});
  elemContent.append(buttonDelete);

  return {
    popup,
    showWaitPopup,
    popupTitle,
    popupForm,
    labelSurname,
    inputSurname,
    inputSurnameError,
    labelName,
    inputName,
    inputNameError,
    labelMiddleName,
    inputMiddleName,
    inputMiddleNameError,
    groupContacts,
    wraperBtnNewContact,
    buttonNewContact,
    fieldMessageErrorEdit,
    buttonSaveClient,
    buttonCancel,
    buttonDelete
  };
};

/**
 * Удаляем все элементы контактов модальной формы
*/
function clearElementsContact(elemParent) {
  elemParent.querySelectorAll('.popup__form-contact-wrapper').forEach(el => el.remove());
};

/**
 * Создаём и возвращаем элемент контакта для модальной формы
 * {type, value}
*/
function createElemContact(key, contactObj) {
  const wrapperContact = document.createElement('div');
  wrapperContact.classList.add('popup__form-contact-wrapper');
  wrapperContact.id = `contact-${key}`;
  // создаём label для type
  const labelType = document.createElement('label');
  labelType.classList.add('popup__form-contact-label-type');
  labelType.setAttribute('for', `type-contact-${key}`);
  wrapperContact.append(labelType);
  // создаём select для type
  const selectType = document.createElement('select');
  selectType.classList.add('popup__form-contact-select-type');
  selectType.name = 'type';
  selectType.id = `type-contact-${key}`;
  selectType.setAttribute('old-value', 'empty');
  labelType.append(selectType);
  // - создаём options 'Телефон'
  const option1 = document.createElement('option');
  option1.value = 'Телефон';
  option1.textContent = 'Телефон';
  if (contactObj.type === 'Телефон') option1.selected = true;
  selectType.append(option1);
  // создаём options 'Email'
  const option2 = document.createElement('option');
  option2.value = 'Email';
  option2.textContent = 'Email';
  if (contactObj.type === 'Email') option2.selected = true;
  selectType.append(option2);
  // - создаём options 'Facebook'
  const option3 = document.createElement('option');
  option3.value = 'Facebook';
  option3.textContent = 'Facebook';
  if (contactObj.type === 'Facebook') option3.selected = true;
  selectType.append(option3);
  // - создаём options 'VK'
  const option4 = document.createElement('option');
  option4.value = 'VK';
  option4.textContent = 'VK';
  if (contactObj.type === 'VK') option4.selected = true;
  selectType.append(option4);
  // - создаём options 'Другое'
  const option5 = document.createElement('option');
  option5.value = 'Другое';
  option5.textContent = 'Другое';
  if (contactObj.type === 'Другое') option5.selected = true;
  selectType.append(option5);
  // подключаем кастомный select к selectType
  new Choices(selectType, {searchEnabled: false, itemSelectText: '', shouldSort: false});
  // - перенос aria-метки selectType на кастомный select
  const ariaLabel = selectType.getAttribute('aria-label');
  selectType.closest('.choices').setAttribute('aria-label', ariaLabel);
  // создаём label для value
  const labelValue = document.createElement('label');
  labelValue.classList.add('popup__form-contact-label-value');
  wrapperContact.append(labelValue);
  // + создаём поле ввода inputValue
  const inputValue = document.createElement('input');
  inputValue.classList.add('popup__form-contact-input-value');
  inputValue.id = `input-contact-${key}`;
  inputValue.value = contactObj.value;
  inputValue.placeholder = 'Введите данные контакта';
  labelValue.append(inputValue);
  // - inputValueError
  const inputValueError = document.createElement('div');
  inputValueError.classList.add('popup__form-contact-input-value-error', 'is-hidden');
  inputValueError.textContent = '';
  labelValue.append(inputValueError);
  // создаём кнопку удаления контакта
  const buttonDelContact = document.createElement('button');
  buttonDelContact.classList.add('btn', 'btn__delcont', 'is-hidden');
  buttonDelContact.type = 'button';
  buttonDelContact.setAttribute('data-tippy-content', 'Удалить контакт');
  buttonDelContact.innerHTML = `<svg class="btn__delcont-icon" width="16" height="16" viewbox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill="#B0B0B0"/>
                                </svg>`;
  createTooltip(buttonDelContact);
  // создаём обработчик кнопки удаления контакта
  buttonDelContact.addEventListener('click', function() {
    wrapperContact.remove(document.getElementById(`contact-${key}`));
    checkExistContacts();
  });
  wrapperContact.append(buttonDelContact);
  // создаём обработчик на поле ввода inputValue
  inputValue.addEventListener('input', function() {
    eventHandlerValidateContact(selectType, inputValue, inputValueError, buttonDelContact);
  });
  //
  // добавляем обработчика на изменение выбора в select
  selectType.addEventListener('change', function() {
    eventHandlerChangeTypeContact(selectType, inputValue, inputValueError, buttonDelContact);
  });
  // выполняем для inputValue настройки по валидации через переопределение типа контакта
  eventHandlerChangeTypeContact(selectType, inputValue, inputValueError, buttonDelContact);

  return {
    wrapperContact,
    selectType,
    inputValue,
    inputValueError,
    buttonDelContact
  };
};

/**
 * Показываем модальную форму создания/изменения клиента
 * typePopup = 'new' или 'edit'
*/
function openPopupEdit(typePopup, inputId = null) {
  // если закончилась анимация закрытия popup
  if (unlock) {
    bodyLock(); // блокировка скролла у body
    currIdEdit = inputId;
    // подготовка формы
    clearElementsContact(popupEdit.groupContacts);
    if (typePopup === 'new') {
      modeEdit = 'new';
      popupEdit.popupTitle.innerHTML = 'Новый клиент';
      popupEdit.inputSurname.value = '';
      eventHandlerPreValidateField(popupEdit.labelSurname, popupEdit.inputSurname);
      popupEdit.inputName.value = '';
      eventHandlerPreValidateField(popupEdit.labelName, popupEdit.inputName);
      popupEdit.inputMiddleName.value = '';
      eventHandlerPreValidateField(popupEdit.labelMiddleName, popupEdit.inputMiddleName);
      popupEdit.groupContacts.classList.add('is-hidden');
      popupEdit.wraperBtnNewContact.classList.remove('is-hidden');
      popupEdit.buttonCancel.classList.remove('is-hidden');
      popupEdit.buttonDelete.classList.add('is-hidden');
    } else if (typePopup === 'edit') {
      modeEdit = 'edit';
      const client = clientsShow.find(client => client.id === inputId);
      popupEdit.popupTitle.innerHTML = `Изменить данные<span class="popup__title-id">&emsp;ID: ${inputId}</span>`;
      popupEdit.inputSurname.value = client.surname;
      eventHandlerPreValidateField(popupEdit.labelSurname, popupEdit.inputSurname);
      popupEdit.inputName.value = client.name;
      eventHandlerPreValidateField(popupEdit.labelName, popupEdit.inputName);
      popupEdit.inputMiddleName.value = client.middleName;
      eventHandlerPreValidateField(popupEdit.labelMiddleName, popupEdit.inputMiddleName);
      if (client.contacts.length > 0) {
        // разворачивание контактов
        for (const key in client.contacts) {
          const elemContactObj = createElemContact(key, client.contacts[key]);
          eventHandlerValidateContact(elemContactObj.selectType, elemContactObj.inputValue, elemContactObj.inputValueError, elemContactObj.buttonDelContact)
          popupEdit.groupContacts.append(elemContactObj.wrapperContact);
        }
      }
      popupEdit.buttonCancel.classList.add('is-hidden');
      popupEdit.buttonDelete.classList.remove('is-hidden');
    }
    checkExistContacts();
    closeFieldMessageError(popupEdit.fieldMessageErrorEdit);
    // показ формы
    popupEdit.popup.classList.add('open');
  }
};

/**
 * Создаём модальную форму удаления клиента
 * и возвращаем объект с элементами формы
*/
function createPopupDel() {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.style.zIndex = 200;
  elemBody.append(popup);
  const elemPlaceCenterY = document.createElement('div');
  elemPlaceCenterY.classList.add('flex', 'popup__place-center-Y');
  popup.append(elemPlaceCenterY);
  const elemContent = document.createElement('div');
  elemContent.classList.add('flex', 'flex-column', 'popup__content', 'popup__content-del');
  elemPlaceCenterY.append(elemContent);
  // индикация ожидания работы с данными
  const showWaitPopup = document.createElement('div');
  showWaitPopup.classList.add('popup__content-wait', 'is-hidden');
  showWaitPopup.style.zIndex = 202;
  elemContent.append(showWaitPopup);
  // кнопка закрытия модального окна
  const elemBtnClose = document.createElement('button');
  elemBtnClose.classList.add('btn', 'popup__btn-close');
  elemBtnClose.innerHTML = '<img class="popup__btn-close-icon" src="../img/icon-close.svg"></img>';
  elemBtnClose.style.zIndex = 201;
  // + обработчик закрытия popup по клику
  elemBtnClose.addEventListener('click', function() {closePopup(popup, 'del')});
  elemContent.append(elemBtnClose);
  // заголовок окна
  const elemTitle = document.createElement('h3');
  elemTitle.classList.add('popup__title', 'popup__title-del');
  elemTitle.textContent = 'Удалить клиента';
  elemContent.append(elemTitle);
  // заголовок окна
  const popupText = document.createElement('p');
  popupText.classList.add('popup__question');
  popupText.textContent = 'Вы действительно хотите удалить данного клиента?';
  elemContent.append(popupText);
  // создаём поле вывода ошибки записи/удаления клиента
  const fieldMessageErrorDel = createFieldMessageError();
  elemContent.append(fieldMessageErrorDel);
  // создаём обёртку для кнопки подтверждения удаления
  const wraperBtnConfirm = document.createElement('div');
  wraperBtnConfirm.classList.add('flex', 'flex-column', 'popup__wraper-btn-confirm');
  elemContent.append(wraperBtnConfirm);
  // кнопка подтверждения удаления
  const elemBtnConfirm = document.createElement('button');
  elemBtnConfirm.classList.add('btn', 'btn__fill');
  elemBtnConfirm.textContent = 'Удалить';
  // + обработчик удаления клиента и закрытия popup по клику
  elemBtnConfirm.addEventListener('click', async function() {
    showWaitPopup.classList.remove('is-hidden');
    closeFieldMessageError(fieldMessageErrorDel);
    // удаление клиента в БД
    const resObj = await deleteClient(currIdDel);
    if (resObj.status === 200) scrollToId = findNearIdClient(currIdDel);
    else {
      scrollToId = currIdDel;
      showFieldMessageError(fieldMessageErrorDel, resObj);
    }
    showWaitPopup.classList.add('is-hidden');
    if (resObj.status !== 200) return;
    if (popupEdit.popup.classList.contains('open')) {
      closePopup(popupEdit.popup, 'edit', true);
    }
    // удаление клиента в базовом массиве clients
    let idx = clients.findIndex(function(item) {return item.id === currIdDel});
    clients.splice(idx, 1);
    closePopup(popup, 'del');
    await createClientsShow(false);
    showRowsTable();
  });
  wraperBtnConfirm.append(elemBtnConfirm);
  // кнопка отмены удаления
  const elemBtnCancel = document.createElement('button');
  elemBtnCancel.classList.add('btn', 'btn__underline');
  elemBtnCancel.textContent = 'Отмена';
  // + обработчик закрытия popup по клику
  elemBtnCancel.addEventListener('click', function() {closePopup(popup, 'del')});
  elemContent.append(elemBtnCancel);

  return {
    popup,
    showWaitPopup,
    popupText,
    fieldMessageErrorDel
  };
};

/**
 * Показываем модальную форму удаления клиента
*/
function openPopupDel(inputId = null) {
  // если закончилась анимация закрытия popup
  if (unlock) {
    bodyLock(); // блокировка скролла у body
    //
    currIdDel = inputId === null ? currIdEdit : inputId;
    if (currIdDel !== null) {
      const rowCell = document.querySelectorAll(`.cell-id-${currIdDel}`);
      const strFio = rowCell[1].textContent;
      popupDel.popupText.innerHTML = `Вы действительно хотите удалить данного клиента: ID${currIdDel},<br>${strFio}?`;
      closeFieldMessageError(popupDel.fieldMessageErrorDel);
      popupDel.popup.classList.add('open');
    }
  }
};

// Cоздаём обработчик события submit на форме по нажатию кнопки buttonSaveClient
async function eventHandlerValidateForm() {
  // Валидация введённых в поля данных
  let isValidateOk = true;
  let isNotError = true;
  if (popupEdit.inputSurname.value.trim().length < 2) {
    if (popupEdit.inputSurname.value.trim().length === 0) popupEdit.inputSurnameError.textContent = 'Укажите фамилию клиента';
    else popupEdit.inputSurnameError.textContent = 'Фамилия не может быть короче 2 букв';
    popupEdit.inputSurnameError.classList.remove('is-hidden');
    popupEdit.inputSurname.focus();
    isNotError = false;
    isValidateOk = false;
  }
  if (popupEdit.inputName.value.trim().length < 2) {
    if (popupEdit.inputName.value.trim().length === 0) popupEdit.inputNameError.textContent = 'Укажите имя клиента';
    else popupEdit.inputNameError.textContent = 'Имя не может быть короче 2 букв';
    popupEdit.inputNameError.classList.remove('is-hidden');
    if (isNotError) popupEdit.inputName.focus();
    isNotError = false;
    isValidateOk = false;
  }
  if (popupEdit.inputMiddleName.value.trim().length > 0 && popupEdit.inputMiddleName.value.trim().length < 2) {
    popupEdit.inputMiddleName.textContent = 'Отчество не может быть короче 2 букв';
    popupEdit.inputMiddleNameError.classList.remove('is-hidden');
    if (isNotError) popupEdit.inputMiddleName.focus();
    isNotError = false;
    isValidateOk = false;
  }
  // валидация контактов
  const elemContacts = popupEdit.popupForm.querySelector('.popup__group-contacts').childNodes;
  const arrayContacts = [];
  let isValid;
  if (elemContacts.length > 0) {
    // разбор контактов
    elemContacts.forEach(elemContact => {
      const elemType = elemContact.querySelector('.popup__form-contact-select-type');
      const elemValue = elemContact.querySelector('.popup__form-contact-input-value');
      const elemValueError = elemContact.querySelector('.popup__form-contact-input-value-error');
      const elemBth = elemContact.querySelector('.btn__delcont');
      isValid = eventHandlerValidateContact(elemType, elemValue, elemValueError, elemBth, true);
      if (!isValid) isValidateOk = false;
      arrayContacts.push({type: elemType.value, value: elemValue.value});
    });
  }
  if (!isValidateOk) return;
  // Сохранение данных клиента
  popupEdit.showWaitPopup.classList.remove('is-hidden');
  closeFieldMessageError(popupEdit.fieldMessageErrorEdit);
  // - подготовка данных по клиенту
  const saveData = {name: popupEdit.inputName.value.trim(),
                    surname: popupEdit.inputSurname.value.trim(),
                    middleName: popupEdit.inputMiddleName.value.trim(),
                    contacts: arrayContacts};
  // - запись клиента в БД
  let resObj;
  if (modeEdit === 'new') resObj = await newClient(saveData);
  else resObj = await updateClient(currIdEdit, saveData);
  // - обработка результата записи
  if (resObj.status === 200 || resObj.status === 201) scrollToId = resObj.data.id;
  else {
    scrollToId = currIdEdit;
    showFieldMessageError(popupEdit.fieldMessageErrorEdit, resObj);
  }
  popupEdit.showWaitPopup.classList.add('is-hidden');
  if (resObj.status !== 200 && resObj.status !== 201) return;
  closePopup(popupEdit.popup, 'edit');
  // перезагрузка данных и их отображение
  await createClientsShow(true);
  showRowsTable();
};

/**
 * Полифилы поддержки разными браузерами
*/
(function () {
  // проверяем поддержку
  if (!Element.prototype.closest) {
    // реализуем поддержку
    Element.prototype.closest = function (css) {
      var node = this;
      while (node) {
        if (node.matches(css)) return node;
        else node = node.parentElement;
      };
      return null;
    };
  }
})();
(function () {
  // проверяем поддержку
  if (!Element.prototype.matches) {
    // реализуем поддержку
    Element.prototype.matches = Element.prototype.matchesSelector ||
                                Element.prototype.webkitMatchesSelector ||
                                Element.prototype.mozMatchesSelector ||
                                Element.prototype.msMatchesSelector;
  }
})();
