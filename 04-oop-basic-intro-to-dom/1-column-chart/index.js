export default class ColumnChart {
  element = null;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = (value) => (value),
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.element = this.createElement();
    this.toggleView();
  }

  createTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">${this.createColumns()}</div>
        </div>
      </div>
    `;
  }

  createColumns() {
    if (!this.data.length) {
      return '';
    }

    const heightFactor = this.chartHeight / Math.max(...this.data);
    return this.data.map((height) => (
      `<div style="--value: ${Math.floor(height * heightFactor)}" data-tooltip="${Math.round(height * heightFactor / this.chartHeight * 100)}%"></div>`
    )).join('\n');
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();
    return element.firstElementChild;
  }

  toggleView() {
    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  update(data) {
    this.data = data;
    this.toggleView();

    const chart = this.element.querySelector('[data-element="body"]');
    chart.innerHTML = this.createColumns();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
