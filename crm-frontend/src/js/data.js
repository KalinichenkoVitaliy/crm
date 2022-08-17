'use strict';

/**
 * Получить список клиентов
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function loadClients() {
  const response = await fetch('http://localhost:3000/api/clients');
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};

/**
 * Получить список клиентов, в параметр search можно передать поисковый запрос
 * @param {string} searchStr - Поисковая строка
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function searchClients(searchStr) {
  // const url = new URL('http://localhost:3000/api/clients');
  // url.searchParams.set('search', searchStr);
  // const response = await fetch(url);
  const response = await fetch(`http://localhost:3000/api/clients?search=${searchStr}`);
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};

/**
 * Получить данные клиента с указанным id
 * @param {string} id - ID клиента
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function getClientById(id) {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`);
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};

/**
 * Сохранить нового клиента
 * @param {{ name: string, surname: string, middleName?: string, contacts?: object[type: string, value string] }} dataObj - Объект с изменяемыми данными
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function newClient(inData) {
  const response = await fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: inData.name,
      surname: inData.surname,
      middleName: inData.middleName,
      contacts: inData.contacts
    })
  });
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};

/**
 * Изменить клиента с указанным ID
 * @param {string} id - ID изменяемого клиента
 * @param {{ name?: string, surname?: string, middleName?: string, contacts?: object[] }} dataObj - Объект с изменяемыми данными
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function updateClient(id, inData) {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: inData.name,
      surname: inData.surname,
      middleName: inData.middleName,
      contacts: inData.contacts
    })
  });
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};

/**
 * Удалить клиента
 * @param {string} id - ID удаляемого клиента
 * @returns {Object} - Объект, созданный из тела ответа
 */
async function deleteClient(id) {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: 'DELETE'
  });
  const status = response.status;
  const data = await response.json();
  return {
    status,
    data
  };
};
