export default class DoubleSlider {
  constructor({
    min = 0,
    max = 100,
    formatValue = (x) => x,
    selected = {}
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = {
      from: selected.from ?? min,
      to: selected.to ?? max,
    };

    this.element = this._createElement();

    this.subElements = {
      leftSlider: this.element.querySelector('.range-slider__thumb-left'),
      rightSlider: this.element.querySelector('.range-slider__thumb-right'),
      bar: this.element.querySelector('.range-slider__inner'),
      progressBar: this.element.querySelector('.range-slider__progress'),
      from: this.element.querySelector('span[data-element="from"]'),
      to: this.element.querySelector('span[data-element="to"]'),
    };

    this._activateSliders();
  }

  _valueToPercent(value, side) {
    const leftOffset = Math.round((value - this.min) / (this.max - this.min) * 100);
    return side === 'left' ? leftOffset : 100 - leftOffset;
  }

  _percentToValue(percent, side) {
    const offset = Math.round((this.max - this.min) * percent / 100);
    return side === 'left' ? this.min + offset : this.max - offset;
  }

  _createTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="
            left: ${this._valueToPercent(this.selected.from, 'left')}%;
            right: ${this._valueToPercent(this.selected.to, 'right')}%">
          </span>
          <span class="range-slider__thumb-left" style="left: ${this._valueToPercent(this.selected.from, 'left')}%"></span>
          <span class="range-slider__thumb-right" style="right: ${this._valueToPercent(this.selected.to, 'right')}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  _createElement() {
    const element = document.createElement('div');
    element.innerHTML = this._createTemplate();
    return element.firstElementChild;
  }

  _activateSliders() {
    const onMouseMoveLeftSlider = (event) => {
      const barBoundaries = this.subElements.bar.getBoundingClientRect();
      const halfSliderWidth = 6 / 2;

      const percentOffset = Math.round(Math.min(Math.max((event.clientX - barBoundaries.left + halfSliderWidth) / barBoundaries.width * 100, 0), 100 - parseInt(this.subElements.rightSlider.style.right)));
      this.selected.from = this._percentToValue(percentOffset, 'left');
      this.subElements.from.textContent = this.formatValue(this.selected.from);

      this.subElements.leftSlider.style.left = percentOffset + '%';
      this.subElements.progressBar.style.left = percentOffset + '%';
    };

    const onMouseMoveRightSlider = (event) => {
      const barBoundaries = this.subElements.bar.getBoundingClientRect();
      const halfSliderWidth = 6 / 2;

      const percentOffset = Math.round(Math.min(Math.max(100 - (event.clientX - barBoundaries.left + halfSliderWidth) / barBoundaries.width * 100, 0), 100 - parseInt(this.subElements.leftSlider.style.left)));
      this.selected.to = this._percentToValue(percentOffset, 'right');
      this.subElements.to.textContent = this.formatValue(this.selected.to);

      this.subElements.rightSlider.style.right = percentOffset + '%';
      this.subElements.progressBar.style.right = percentOffset + '%';
    };

    this.subElements.bar.addEventListener('pointerdown', (event) => {
      let onMouseMove;

      if (event.target === this.subElements.leftSlider) {
        document.removeEventListener('pointermove', onMouseMoveRightSlider);
        onMouseMove = onMouseMoveLeftSlider;
      } else if (event.target === this.subElements.rightSlider) {
        document.removeEventListener('pointermove', onMouseMoveLeftSlider);
        onMouseMove = onMouseMoveRightSlider;
      } else {
        return;
      }

      const onPointerUp = () => {
        document.removeEventListener('pointermove', onMouseMove);
        this.element.dispatchEvent(
          new CustomEvent('range-select', {
            detail: {
              from: this.selected.from,
              to: this.selected.to,
            },
            bubbles: true,
          })
        );
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onMouseMove);
      document.addEventListener('pointerup', onPointerUp);
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
