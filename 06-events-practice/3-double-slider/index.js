export default class DoubleSlider {
  element = null;

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

    this._createElement();
    this._activateSliders();
  }

  _calculatePercentFromValue(value, side) {
    const leftOffset = Math.round((value - this.min) / (this.max - this.min) * 100);
    return side === 'left' ? leftOffset : 100 - leftOffset;
  }

  _calculateValueFromPercent(percent, side) {
    const offset = Math.round((this.max - this.min) * percent / 100);
    return side === 'left' ? this.min + offset : this.max - offset;
  }

  _createTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="
            left: ${this._calculatePercentFromValue(this.selected.from, 'left')}%;
            right: ${this._calculatePercentFromValue(this.selected.to, 'right')}%">
          </span>
          <span class="range-slider__thumb-left" style="left: ${this._calculatePercentFromValue(this.selected.from, 'left')}%"></span>
          <span class="range-slider__thumb-right" style="right: ${this._calculatePercentFromValue(this.selected.to, 'right')}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  _createElement() {
    const element = document.createElement('div');
    element.innerHTML = this._createTemplate();
    this.element = element.firstElementChild;

    this.leftSlider = this.element.querySelector('.range-slider__thumb-left');
    this.rightSlider = this.element.querySelector('.range-slider__thumb-right');
    this.bar = this.element.querySelector('.range-slider__inner');
    this.progressBar = this.element.querySelector('.range-slider__progress');
    this.fromValue = this.element.querySelector('span[data-element="from"]');
    this.toValue = this.element.querySelector('span[data-element="to"]');
  }

  _activateSliders() {
    const onChangeEvent = new CustomEvent('range-select', {
      detail: {
        from: 130,
        to: 150,
      },
    });

    const handleValueUpdate = (percent, side) => {
      if (side === 'left') {
        this.fromValue.textContent = this.formatValue(this._calculateValueFromPercent(percent, side));
      } else {
        this.toValue.textContent = this.formatValue(this._calculateValueFromPercent(percent, side));
      }
    };

    const handleMovement = (side) => {
      const slider = this;
      return function() {
        const { left: leftEdge, right: rightEdge } = slider.bar.getBoundingClientRect();
        const sliderWidth = parseInt(getComputedStyle(this).width) / 2;

        const moveAtLeft = (pageX) => {
          const percentOffset = Math.round(Math.min(Math.max((pageX - leftEdge + sliderWidth) / (rightEdge - leftEdge) * 100, 0), 100 - parseInt(slider.rightSlider.style.right)));
          handleValueUpdate(percentOffset, 'left');

          this.style.left = percentOffset + '%';
          slider.progressBar.style.left = this.style.left;
        };

        const moveAtRight = (pageX) => {
          const percentOffset = Math.round(Math.min(Math.max(100 - (pageX - leftEdge + sliderWidth) / (rightEdge - leftEdge) * 100, 0), 100 - parseInt(slider.leftSlider.style.left)));
          handleValueUpdate(percentOffset, 'right');

          this.style.right = percentOffset + '%';
          slider.progressBar.style.right = this.style.right;
        };

        const moveAt = side === 'left' ? moveAtLeft : moveAtRight;
        const onMouseMove = (event) => moveAt(event.pageX);

        document.addEventListener('pointermove', onMouseMove);
        document.addEventListener(
          'pointerup',
          () => {
            document.removeEventListener('pointermove', onMouseMove);
            document.dispatchEvent(onChangeEvent);
          },
          { once: true }
        );
      };
    };

    this.leftSlider.onpointerdown = handleMovement('left');
    this.rightSlider.onpointerdown = handleMovement('right');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
