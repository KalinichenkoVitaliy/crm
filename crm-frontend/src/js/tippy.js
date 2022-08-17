'use strict';

// ---------------------------------------- Секция tippy ---------------------------------------- //

// Параметры tippy
const paramTooltip = {
  content: 'Пример подсказки',

  // Анимация: 'fade', 'scale',
  animation: 'scale',

  // Если вы передаете неизвестные пользовательские данные в content, отключите HTML в целях безопасности
  // allowHTML: false, allowHTML: true,
  allowHTML: true,

  // Стрелка, указывающая на элемент, может иметь измененную пропорцию или форму, или может быть полностью отключена
  // true, false, arrow: '<svg>...</svg>', arrow: svgElement,
  arrow: true,

  // Задержка от наведения на элемент до появления подсказки и после покидания эелемента
  // delay: 0, delay: 100, delay: [100, 200], delay: [100, null],
  delay: 200,

  // Продолжительность анимации перехода в мс
  // duration: [300, 250], duration: 100, duration: [100, 200], duration: [100, null],
  duration: 300,

  // Cледовать за курсором мыши и придерживаться определенной оси
  // false, true, 'horizontal', 'vertical', 'initial',
  followCursor: false,

  // Определяет, есть ли внутри подсказки интерактивный контент, чтобы его можно было навести и щелкнуть внутри, не скрываясь
  // interactive: false, interactive: true,
  interactive: false,

  // Определяет размер невидимой границы вокруг подсказки, которая не даст ей скрыться, если курсор покинет ее
  // interactiveBorder: 2, interactiveBorder: 30,
  interactiveBorder: 0,

  // Задает максимальную ширину подсказки
  // maxWidth: 350, maxWidth: 'none',
  maxWidth: 350,

  // Места размещения подсказки
  // 'top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end',
  // 'left', 'left-start', 'left-end', 'auto', 'auto-start', 'auto-end',
  placement: 'top',

  // Задает roleатрибут элемента типа tippy
  role: 'tooltip',

  // Определяет, прилипает ли наконечник к опорному элементу при его установке
  // sticky: false, sticky: true, sticky: 'reference', sticky: 'popper',
  sticky: false,

  // Позволяет отделить положение наконечника от источника срабатывания
  // triggerTarget: null, triggerTarget: someElement, triggerTarget: [someElement1, someElement2],
  riggerTarget: null,

  // Определяет тему типичного элемента. По умолчанию основной CSS использует темную #333 тему
  // theme: '', theme: 'light', theme: 'light-border', theme: 'material', theme: 'translucent', theme: 'mytheme',
  theme: 'mytheme',

  // Расстояние и смещение подсказки в пикселях
  // offset: [5, 10],

//   // Вызывается, когда типпи начинает показывать.
//   onShow(instance) {
//     tooltipShowIconOnOpen(instance);
//   },

//   onHide(instance) {
//     tooltipCloseIconOnOpen(instance);
//   },
};

const paramTooltipA = {
  content: 'Пример подсказки',

  // Анимация: 'fade', 'scale',
  animation: 'scale',

  // Если вы передаете неизвестные пользовательские данные в content, отключите HTML в целях безопасности
  // allowHTML: false, allowHTML: true,
  allowHTML: true,

  // Стрелка, указывающая на элемент, может иметь измененную пропорцию или форму, или может быть полностью отключена
  // true, false, arrow: '<svg>...</svg>', arrow: svgElement,
  arrow: true,

  // Задержка от наведения на элемент до появления подсказки и после покидания эелемента
  // delay: 0, delay: 100, delay: [100, 200], delay: [100, null],
  delay: 200,

  // Продолжительность анимации перехода в мс
  // duration: [300, 250], duration: 100, duration: [100, 200], duration: [100, null],
  duration: 300,

  // Cледовать за курсором мыши и придерживаться определенной оси
  // false, true, 'horizontal', 'vertical', 'initial',
  followCursor: false,

  // Определяет, есть ли внутри подсказки интерактивный контент, чтобы его можно было навести и щелкнуть внутри, не скрываясь
  // interactive: false, interactive: true,
  interactive: true,

  // Определяет размер невидимой границы вокруг подсказки, которая не даст ей скрыться, если курсор покинет ее
  // interactiveBorder: 2, interactiveBorder: 30,
  interactiveBorder: 0,

  // Задает максимальную ширину подсказки
  // maxWidth: 350, maxWidth: 'none',
  maxWidth: 350,

  // Места размещения подсказки
  // 'top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end',
  // 'left', 'left-start', 'left-end', 'auto', 'auto-start', 'auto-end',
  placement: 'top',

  // Задает roleатрибут элемента типа tippy
  role: 'tooltip',

  // Определяет, прилипает ли наконечник к опорному элементу при его установке
  // sticky: false, sticky: true, sticky: 'reference', sticky: 'popper',
  sticky: false,

  // Позволяет отделить положение наконечника от источника срабатывания
  // triggerTarget: null, triggerTarget: someElement, triggerTarget: [someElement1, someElement2],
  riggerTarget: null,

  // Определяет тему типичного элемента. По умолчанию основной CSS использует темную #333 тему
  // theme: '', theme: 'light', theme: 'light-border', theme: 'material', theme: 'translucent', theme: 'mytheme',
  theme: 'mytheme',
};

// Назначение всем элементам DOM c data-toggle="tooltip" своего тултипа с указанным в data-tippy-content тесктом
function createTooltips() {
  tippy('[data-tippy-content]', paramTooltip);
};

// Назначение элементу DOM своего тултипа с указанным в data-tippy-content тесктом
function createTooltip(elemDom) {
  tippy(elemDom, paramTooltip);
};


// Назначение элементу DOM с копиремой ссылкой своего тултипа с указанным в data-tippy-content тесктом
function createTooltipA(elemDom) {
  tippy(elemDom, paramTooltipA);
};
