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
    this.sorted.order ??= 'asc';
    this.sorted.id ??= headersConfig.find((header) => header.sortable).id;

    this.sort();
    this.createListenersForHeaders();
  }

  createListenersForHeaders() {
    for (const headerCell of this.subElements.header.children) {
      if (headerCell.dataset.sortable === 'true') {
        headerCell.addEventListener('pointerdown', () => {
          this.sort(
            headerCell.dataset.id,
            headerCell.dataset.order === 'desc' ? 'asc' : 'desc'
          );
        });
      }
    }
  }

  sort(id = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;
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
