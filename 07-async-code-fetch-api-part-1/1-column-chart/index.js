import ColumnChartv1 from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartv1 {
  constructor({ url, range, label, link, formatHeading } = {}) {
    super({ label, link, formatHeading });

    this.url = url ?? '';
    this.range = range ?? {
      from: new Date(),
      to: new Date(),
    };

    this.subElements = {
      body: this.element.querySelector('[data-element="body"]'),
      header: this.element.querySelector('[data-element="header"]'),
    };

    this.update(this.range.from, this.range.to);
  }

  async _fetchData() {
    let url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', this.range.from);
    url.searchParams.set('to', this.range.to);

    const response = await fetchJson(url);
    return response;
  }

  async update(from, to) {
    this.range = { from, to };
    const data = await this._fetchData();
    super.update(Object.values(data));
    return data;
  }
}
