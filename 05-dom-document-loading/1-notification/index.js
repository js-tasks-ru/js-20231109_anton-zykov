export default class NotificationMessage {
  static timeoutID = null;
  static visibleElement = null;
  element = null;

  constructor(message, { duration, type } = {}) {
    this.message = message;
    this.duration = duration ?? 1000;
    this.type = type ?? 'success';

    this.element = this.createElement();
  }

  createTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Header</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();
    return element.firstElementChild;
  }

  show(container = document.body) {
    if (NotificationMessage.timeoutID) {
      clearTimeout(NotificationMessage.timeoutID);
      NotificationMessage.timeoutID = null;
      NotificationMessage.visibleElement.remove();
    }

    container.append(this.element);
    NotificationMessage.visibleElement = this.element;

    NotificationMessage.timeoutID = setTimeout(() => {
      this.remove();
      NotificationMessage.timeoutID = null;
      NotificationMessage.visibleElement = null;
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
