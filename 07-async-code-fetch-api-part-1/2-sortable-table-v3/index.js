import SortableTablev2 from '../../06-events-practice/1-sortable-table-v2/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTablev2 {
  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = false,
    url = '',
  } = {}) {
    super(headersConfig, { data, sorted });
    this.originalData = [...this.data];
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.render();
  }

  sortOnServer(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;
    this.render();
  }

  async loadData({ start = 0, end = 30 } = {}) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', this.sorted.id);
    url.searchParams.set('_order', this.sorted.order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    const response = await fetchJson(url);
    this.data = this.normalizeData(response);
  }

  async render() {
    await this.loadData();

    this.subElements.body = this.createTableBody();
    this.createArrow(this.sorted.id, this.sorted.order);

    this.element.querySelector('[data-element="body"]').remove();
    this.element.append(this.subElements.body);
  }
}
