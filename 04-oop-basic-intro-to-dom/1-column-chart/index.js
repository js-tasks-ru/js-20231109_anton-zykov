export default class ColumnChart {
  _element = null;

  constructor({ data, label, value, link, formatHeading }) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.create();

    if (data.length) {
      this.update();
    }
  }

  get element() {
    return this._element;
  }

  create() {
    const element = document.createElement('div');
    element.className = 'column-chart column-chart_loading';

    const title = document.createElement('div');
    title.className = 'column-chart__title';
    title.append(this.label);

    if (this.link) {
      const link = document.createElement('a');
      link.className = 'column-chart__link';
      link.setAttribute('href', this.link);
      link.innerText = 'Подробнее';
      title.append(link);
    }

    element.append(title);

    const container = document.createElement('div');
    container.className = 'column-chart__container';
    element.append(container);

    const header = document.createElement('div');
    header.className = 'column-chart__header';
    header.innerText = this.formatHeading
      ? this.formatHeading(this.value)
      : this.value;
    container.append(header);

    this._element = element;
  }

  update() {}
}
