import { pick } from '../../02-javascript-data-types/2-pick/index.js';

export default class SortableTable {
  element = null;
  arrow = {
    column: null,
    element: null,
  }

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;

    this.data = data.map((item) => {
      const driedItem = pick(item, ...headerConfig.map((column) => column.id));
      driedItem.rowElement = this.createTableRow(item);
      return driedItem;
    });

    this.subElements = {
      header: this.createTableHeader(),
      body: this.createTableBody(),
    };
    this.element = this.createElement();
  }

  createTableRow(item) {
    const rowElement = document.createElement('a');
    rowElement.href = `/products/${item.id}`;
    rowElement.className = 'sortable-table__row';

    for (let column of this.headerConfig) {
      const cell = document.createElement('div');

      if (column.template) {
        cell.innerHTML = column.template(item[column.id]);
        rowElement.append(cell.firstElementChild);
        continue;
      }

      cell.className = 'sortable-table__cell';
      cell.innerHTML = item[column.id];
      rowElement.append(cell);
    }

    return rowElement;
  }

  createTableHeader() {
    const headerElement = document.createElement('div');
    headerElement.dataset.element = 'header';
    headerElement.className = 'sortable-table__header sortable-table__row';

    for (let column of this.headerConfig) {
      const cell = document.createElement('div');
      cell.dataset.id = column.id;
      cell.dataset.sortable = column.sortable;
      cell.className = 'sortable-table__cell';
      cell.innerHTML = `<span>${column.title}</span>`;
      headerElement.append(cell);
    }

    return headerElement;
  }

  createTableBody() {
    const bodyElement = document.createElement('div');
    bodyElement.dataset.element = 'body';
    bodyElement.className = 'sortable-table__body';
    bodyElement.innerHTML = this.data.reduce((cellsString, item) => (
      cellsString.concat(item.rowElement.outerHTML)
    ), '');
    return bodyElement;
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'sortable-table';
    element.append(this.subElements.header, this.subElements.body);
    return element;
  }

  sort(field, order) {
    const { sortType } = this.headerConfig.find((column) => column.id === field);
    const orderFactor = order === 'asc' ? 1 : -1;

    if (sortType === 'number') {
      this.data.sort((a, b) => (a[field] - b[field]) * orderFactor);
    } else if (sortType === 'string') {
      this.data.sort((a, b) => (
        orderFactor * a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: 'upper' })
      ));
    }

    this.subElements.body = this.createTableBody();

    if (this.arrow.column) {
      this.arrow.column.removeAttribute('data-order');
      this.arrow.column.lastElementChild.remove();
    } else {
      const arrowContainer = document.createElement('div');
      arrowContainer.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
      `;
      this.arrow.element = arrowContainer.firstElementChild;
    }

    this.arrow.column = this.element.querySelector(`[data-id="${field}"]`);
    this.arrow.column.dataset.order = order;
    this.arrow.column.append(this.arrow.element);

    this.element.lastElementChild.remove();
    this.element.append(this.subElements.body);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

