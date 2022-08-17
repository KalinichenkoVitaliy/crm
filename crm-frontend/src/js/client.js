'use strict';

/**
 * Создаём и показываем карточку клиента с указанным id
 */
async function cratePageDetailClient(clientContent, clientId) {
  // заголовок страницы
  const titlePage = document.createElement('h2');
  titlePage.classList.add('client__title');
  titlePage.textContent = 'CRM - карточка клиента';
  clientContent.append(titlePage);
  // + индикация загрузки для clientContent
  const showLoadingData = document.createElement('div');
  showLoadingData.classList.add('client__content-loading', 'is-hidden');
  clientContent.append(showLoadingData);

  // ID
  const elemId = document.createElement('p');
  elemId.classList.add('client__desc');
  elemId.innerHTML = `1. Идентификационный номер: <span class="client__data">${clientId}</span>`;
  clientContent.append(elemId);

  // показ индикатора загрузки данных
  showLoadingData.classList.remove('is-hidden');

  // загрузка данных из БД
  const resObj = await getClientById(clientId);
  if (resObj.status !== 200 && resObj.status !== 201) {
    alert(`Ошибка загрузки данных клиента:
    код ошибки = ${resObj.status}
    описание ошибки = "${resObj.data.message}"`);
    // скрытие индикатора загрузки данных
    showLoadingData.classList.add('is-hidden');
    return;
  }

  // Фамилия
  const elemSurname = document.createElement('p');
  elemSurname.classList.add('client__desc');
  elemSurname.innerHTML = `2. Фамилия: <span class="client__data">${resObj.data.surname}</span>`;
  clientContent.append(elemSurname);

  // Имя
  const elemName = document.createElement('p');
  elemName.classList.add('client__desc');
  elemName.innerHTML = `3. Имя: <span class="client__data">${resObj.data.name}</span>`;
  clientContent.append(elemName);

  // Отчество
  const elemMiddleName = document.createElement('p');
  elemMiddleName.classList.add('client__desc');
  elemMiddleName.innerHTML = `4. Отчество: <span class="client__data">${resObj.data.middleName}</span>`;
  clientContent.append(elemMiddleName);

  // Заголовок группы контактов
  const elemTitleContacts = document.createElement('p');
  elemTitleContacts.classList.add('client__desc');
  elemTitleContacts.textContent = '5. Контакты:';
  clientContent.append(elemTitleContacts);

  // если есть контакты
  if (resObj.data.contacts.length > 0) {
    // Группа контактов
    const elemGroupContacts = document.createElement('div');
    elemGroupContacts.classList.add('client__group-contacts');
    clientContent.append(elemGroupContacts);

    // Разворачиваем контакт
    for (const key in resObj.data.contacts) {
      const contact = resObj.data.contacts[key];
      const idx = parseInt(key) + 1;
      //
      const elemContact = document.createElement('p');
      elemContact.classList.add('client__desc');
      elemContact.innerHTML = `5.${idx}. ${contact.type}: <span class="client__data">${contact.value}</span>`;
      elemGroupContacts.append(elemContact);
    };
  }

  // скрытие индикатора загрузки данных
  showLoadingData.classList.add('is-hidden');
};
