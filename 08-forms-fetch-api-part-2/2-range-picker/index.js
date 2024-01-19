export default class RangePicker {
  constructor({ from, to }) {
    this.from = from;
    this.to = to;

    this.leftCalendarDate = this.from;
    this.rightCalendarDate = RangePicker.nextMonth(this.leftCalendarDate);

    this.element = this.createElement();
    this.subElements = {
      input: this.element.querySelector('[data-element="input"]'),
      selector: this.element.querySelector('[data-element="selector"]'),
      leftCalendar: null,
      rightCalendar: null,
    };

    this.subElements.input.addEventListener('click', this.handleCalendarOpen);
  }

  static nextMonth (date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  static previousMonth (date) {
    return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
  }

  static formatDate (date, delimiter = '-') {
    return (date.getDate() < 10 ? '0' : '') + date.getDate() + delimiter + (date.getMonth() + 1) + delimiter + date.getFullYear();
  }

  static compareDays(date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return date1.getTime() === date2.getTime()
      ? 0
      : (date1.getTime() - date2.getTime()) / Math.abs(date1.getTime() - date2.getTime());
  }

  createTemplate () {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${RangePicker.formatDate(this.from, '.')}</span> -
          <span data-element="to">${RangePicker.formatDate(this.to, '.')}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  createCalendarTemplate (date) {
    const daysInMonth = Math.round((new Date(date.getFullYear(), date.getMonth() + 1, 1) - new Date(date.getFullYear(), date.getMonth(), 1)) / 1000 / 60 / 60 / 24);
    const cells = [];
    const currentDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startFromDay = currentDay.getDay() === 0 ? currentDay.getDay() + 7 : currentDay.getDay();
    const styleofFirstDay = 'style="--start-from: ' + startFromDay + '"';

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(`
        <button type="button"
                class="rangepicker__cell"
                data-value="${currentDay.toISOString()}"
                ${i === 1 ? styleofFirstDay : ''}
        >${i}</button>
      `);

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return `
      <div class="rangepicker__month-indicator">
        <time datetime="${new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)}">
          ${new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date)}
        </time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">${cells.join('\n')}</div>
    `;
  }

  updateCellsStyles () {
    const calculateClass = (cell) => {
      cell.classList.remove(
        'rangepicker__selected-from',
        'rangepicker__selected-to',
        'rangepicker__selected-between'
      );

      let additionalClass = '';
      const currentDay = new Date(cell.dataset.value);
      const fromOrNow = RangePicker.compareDays(this.from, currentDay);
      const nowOrTo = this.to ? RangePicker.compareDays(currentDay, this.to) : null;

      if (fromOrNow === 0) {
        additionalClass = 'rangepicker__selected-from';
      } else if (nowOrTo === 0) {
        additionalClass = 'rangepicker__selected-to';
      } else if (fromOrNow === -1 && nowOrTo === -1) {
        additionalClass = 'rangepicker__selected-between';
      }

      if (additionalClass) {
        cell.classList.add(additionalClass);
      }
    };

    for (const cell of this.subElements.leftCalendar.querySelector('.rangepicker__date-grid').children) {
      calculateClass(cell);
    }

    for (const cell of this.subElements.rightCalendar.querySelector('.rangepicker__date-grid').children) {
      calculateClass(cell);
    }
  }

  createSelector () {
    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left" data-element="control-left"></div>
      <div class="rangepicker__selector-control-right" data-element="control-right"></div>
      <div class="rangepicker__calendar"></div>
      <div class="rangepicker__calendar"></div>
    `;
    [this.subElements.leftCalendar, this.subElements.rightCalendar]
      = this.element.querySelectorAll('.rangepicker__calendar');
    this.createCalendars();

    if (!this.fromDateSelected) {
      this.subElements.selector.addEventListener('click', this.handleFromDateChoice);
    }

    this.subElements.selector.querySelector('[data-element="control-left"]')
      .addEventListener('click', this.handleLeftControlClick);
    this.subElements.selector.querySelector('[data-element="control-right"]')
      .addEventListener('click', this.handleRightControlClick);
  }

  destroySelector () {
    [this.subElements.leftCalendar, this.subElements.rightCalendar] = [null, null];
    this.leftCalendarDate = this.from;
    this.rightCalendarDate = RangePicker.nextMonth(this.leftCalendarDate);

    this.subElements.selector.querySelector('[data-element="control-left"]')
      .removeEventListener('click', this.handleLeftControlClick);
    this.subElements.selector.querySelector('[data-element="control-right"]')
      .removeEventListener('click', this.handleRightControlClick);

    this.subElements.selector.removeEventListener('click', this.handleFromDateChoice);
    this.subElements.selector.removeEventListener('click', this.handleToDateChoice);
  }

  createCalendars () {
    this.subElements.leftCalendar.innerHTML = this.createCalendarTemplate(this.leftCalendarDate);
    this.subElements.rightCalendar.innerHTML = this.createCalendarTemplate(this.rightCalendarDate);
    this.updateCellsStyles();
  }

  handleFromDateChoice = (event) => {
    if (event.target.tagName !== 'BUTTON') {
      return;
    }
    event.stopPropagation();

    this.from = new Date(event.target.dataset.value);
    this.to = null;

    this.updateCellsStyles();

    this.subElements.selector.removeEventListener('click', this.handleFromDateChoice);
    this.subElements.selector.addEventListener('click', this.handleToDateChoice);
    this.fromDateSelected = true;
  }

  handleToDateChoice = (event) => {
    if (event.target.tagName !== 'BUTTON') {
      return;
    }
    event.stopPropagation();

    this.to = new Date(event.target.dataset.value);
    if (RangePicker.compareDays(this.from, this.to) === 1) {
      [this.from, this.to] = [this.to, this.from];
    }

    this.updateCellsStyles();
    event.target.blur();

    this.subElements.input.querySelector('[data-element="from"]').innerHTML
      = RangePicker.formatDate(this.from, '.');
    this.subElements.input.querySelector('[data-element="to"]').innerHTML
      = RangePicker.formatDate(this.to, '.');

    this.subElements.selector.removeEventListener('click', this.handleToDateChoice);
    this.fromDateSelected = false;
    this.subElements.selector.addEventListener('click', this.handleFromDateChoice);

    this.element.dispatchEvent(
      new CustomEvent('date-select', {
        detail: {
          from: this.from,
          to: this.to,
        },
        bubbles: true
      })
    );
  }

  createElement () {
    const container = document.createElement('div');
    container.innerHTML = this.createTemplate();
    return container.firstElementChild;
  }

  handleCalendarOpen = (event) => {
    event.stopPropagation();
    this.element.classList.add('rangepicker_open');
    this.createSelector();
    this.subElements.input.removeEventListener('click', this.handleCalendarOpen);
    document.addEventListener('click', this.handleCalendarClose);
  }

  handleCalendarClose = (event) => {
    if (!event.target.closest('[data-element="selector"]')) {
      this.element.classList.remove('rangepicker_open');
      this.destroySelector();
      document.removeEventListener('click', this.handleCalendarClose);
      this.subElements.input.addEventListener('click', this.handleCalendarOpen);
    }
  }

  handleLeftControlClick = () => {
    this.leftCalendarDate = RangePicker.previousMonth(this.leftCalendarDate);
    this.rightCalendarDate = RangePicker.previousMonth(this.rightCalendarDate);
    this.createCalendars();
  }

  handleRightControlClick = () => {
    this.leftCalendarDate = RangePicker.nextMonth(this.leftCalendarDate);
    this.rightCalendarDate = RangePicker.nextMonth(this.rightCalendarDate);
    this.createCalendars();
  }

  remove () {
    this.subElements.input.removeEventListener('click', this.handleCalendarOpen);
    document.removeEventListener('click', this.handleCalendarClose);
    if (this.subElements.selector.innerHTML) {
      this.destroySelector();
    }
    this.element.remove();
  }

  destroy () {
    this.remove();
  }
}
