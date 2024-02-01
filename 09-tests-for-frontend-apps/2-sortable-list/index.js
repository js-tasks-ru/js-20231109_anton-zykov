export default class SortableList {
  constructor ({ items }) {
    this.items = items;
    this.element = this.createElement();
  }

  createElement () {
    const element = document.createElement('ul');
    element.className = 'sortable-list';

    this.items.forEach((item) => {
      item.classList.add('sortable-list__item', 'droppable');
      item.setAttribute('data-grab-handle', '');
      item.addEventListener('pointerdown', this.handleItemGrab);
      item.querySelector('[data-delete-handle]').addEventListener('pointerdown', this.handleItemDelete);
      item.ondragstart = () => (false);
      element.append(item);
    });

    return element;
  }

  handleItemGrab = (event) => {
    const item = event.target.closest('li');

    const placeholder = document.createElement('div');
    placeholder.className = 'sortable-list__placeholder';
    placeholder.style.height = item.getBoundingClientRect().height + 'px';

    let shiftX = event.clientX - item.getBoundingClientRect().left;
    let shiftY = event.clientY - item.getBoundingClientRect().top;

    item.style.width = item.getBoundingClientRect().width + 'px';
    item.style.position = 'fixed';
    item.style.zIndex = 1000;

    item.after(placeholder);
    this.element.append(item);

    const moveAt = (pageX, pageY) => {
      const { marginLeft, marginTop } = window.getComputedStyle(item);
      item.style.left = pageX - shiftX - parseInt(marginLeft) + 'px';
      item.style.top = pageY - shiftY - parseInt(marginTop) + 'px';
    };

    moveAt(event.pageX, event.pageY);

    for (const otherItem of this.element.children) {
      if (otherItem !== item && otherItem !== placeholder) {
        otherItem.classList.add('droppable');
      }
    }

    const findChildIndex = (childNode) => (
      Array.prototype.indexOf.call(childNode.parentElement.children, childNode)
    );

    const onPointerMove = (event) => {
      moveAt(event.pageX, event.pageY);

      item.style.display = 'none';
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      item.style.display = 'flex';

      if (!elemBelow) {
        return;
      }

      let droppableBelow = elemBelow.closest('.droppable');

      if (!droppableBelow || droppableBelow.closest('.sortable-list') !== this.element) {
        return;
      }

      if (findChildIndex(placeholder) > findChildIndex(droppableBelow)) {
        droppableBelow.before(placeholder);
      } else {
        droppableBelow.after(placeholder);
      }
    };

    document.addEventListener('pointermove', onPointerMove);

    document.onpointerup = () => {
      for (const listItem of this.element.children) {
        listItem.classList.remove('droppable');
      }

      placeholder.after(item);
      placeholder.remove();
      item.style = '';

      document.removeEventListener('pointermove', onPointerMove);
      document.onpointerup = null;
    };
  }

  handleItemDelete = (event) => {
    const item = event.target.closest('li');
    this.removeEventListenersOfItem(item);
    item.remove();
  }

  removeEventListenersOfItem (item) {
    item.removeEventListener('pointerdown', this.handleItemGrab);
    const deleteHandler = item.querySelector('[data-delete-handle]');
    if (deleteHandler) {
      deleteHandler.removeEventListener('pointerdown', this.handleItemDelete);
    }
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    for (const item of this.element.children) {
      this.removeEventListenersOfItem(item);
    }
    this.remove();
  }
}
