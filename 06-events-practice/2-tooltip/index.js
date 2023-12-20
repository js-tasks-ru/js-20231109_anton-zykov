class Tooltip {
  static element = null;

  constructor() {
    if (Tooltip.element) {
      return Tooltip.element;
    }

    Tooltip.element = this.createElement();
  }

  get element() {
    return Tooltip.element;
  }

  initialize() {
    if (!Tooltip.element) {
      return;
    }

    const move = (event) => {
      Tooltip.element.style.left = event.pageX + 10 + 'px';
      Tooltip.element.style.top = event.pageY + 10 + 'px';
    };

    document.addEventListener('pointerover', (event) => {
      if (!event.target.dataset.tooltip) {
        return;
      }

      this.render(event.target.dataset.tooltip);

      event.target.addEventListener('mousemove', move);
      event.target.addEventListener('pointerout', () => {
        this.destroy();
        event.target.removeEventListener('mousemove', move);
      }, { once: true });
    });
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'tooltip';
    return element;
  }

  render(text) {
    Tooltip.element.textContent = text;
    document.body.append(Tooltip.element);
  }

  remove() {
    Tooltip.element.remove();
  }

  destroy() {
    this.remove();
  }
}

export default Tooltip;
