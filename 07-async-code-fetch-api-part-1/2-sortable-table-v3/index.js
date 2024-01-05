import SortableTablev2 from '../../06-events-practice/1-sortable-table-v2/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTablev2 {
  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = false,
    url = '',
    scrollStep = 30,
  } = {}) {
    super(headersConfig, { data, sorted });
    this.originalData = [...this.data];
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.scroll = {
      step: scrollStep,
      start: 0,
      end: scrollStep,
      allDataLoaded: false,
    };

    this.render()
      .then(() => this.createEmptyPlaceholder());
    this.createScrollListener();
  }

  sortOnServer(id, order) {
    this.data = [];

    this.sorted.id = id;
    this.sorted.order = order;

    this.scroll.start = 0;
    this.scroll.end = this.scroll.step;

    this.render();
  }

  async loadData() {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', this.sorted.id);
    url.searchParams.set('_order', this.sorted.order);
    url.searchParams.set('_start', this.scroll.start);
    url.searchParams.set('_end', this.scroll.end);

    const response = await fetchJson(url);
    this.data = this.data.concat(this.normalizeData(response));

    if (response.length < this.scroll.step) {
      this.scroll.allDataLoaded = true;
    }

    this.scroll.start += response.length;
    this.scroll.end += response.length;
  }

  async render() {
    this.element.classList.remove('sortable-table_empty');
    this.element.classList.add('sortable-table_loading');
    this.createLoadingLine();

    await this.loadData();

    this.element.classList.remove('sortable-table_loading');
    this.removeLoadingLine();

    if (this.data.length) {
      this.subElements.body = this.createTableBody();
      this.createArrow(this.sorted.id, this.sorted.order);

      this.element.querySelector('[data-element="body"]').remove();
      this.element.append(this.subElements.body);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  handleWindowScroll = async () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      this.removeScrollListener();
      await this.render();
      if (!this.scroll.allDataLoaded) {
        this.createScrollListener();
      }
    }
  }

  createScrollListener() {
    document.addEventListener('scroll', this.handleWindowScroll);
  }

  removeScrollListener() {
    document.removeEventListener('scroll', this.handleWindowScroll);
  }

  createLoadingLine() {
    const loadingLine = document.createElement('div');
    loadingLine.dataset.element = "loading";
    loadingLine.className = 'sortable-table__loading-line loading-line';
    this.element.append(loadingLine);
  }

  removeLoadingLine() {
    this.element.querySelector('[data-element="loading"]').remove();
  }

  createEmptyPlaceholder() {
    const template = `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
          <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = template;
    this.element.append(container.firstElementChild);
  }

  remove() {
    super.remove();
    this.removeScrollListener();
  }
}
