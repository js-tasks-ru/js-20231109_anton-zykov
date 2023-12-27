import SortableTablev1 from '../../05-dom-document-loading/2-sortable-table-v1/index.js';

export default class SortableTable extends SortableTablev1 {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    super(headersConfig, data);
    this.originalData = [...this.data];
    this.isSortLocally = true;
    this.sorted = { ...sorted };
    this.sort();
    this.createListenersForHeaders();
  }

  createListenersForHeaders() {
    for (const headerCell of this.subElements.header.children) {
      if (headerCell.dataset.sortable === 'true') {
        headerCell.addEventListener('pointerdown', () => {
          this.sorted.id = headerCell.dataset.id;
          this.sorted.order = headerCell.dataset.order === 'desc' ? 'asc' : 'desc';
          this.sort();
        });
      }
    }
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient() {
    super.sort(this.sorted.id, this.sorted.order);
  }

  sortOnServer() {
    return;
  }

  filter(field, value) {
    this.data = this.originalData.filter((item) => item[field] === value);
    this.sort();
  }
}
