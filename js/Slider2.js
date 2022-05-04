class Slider {
  constructor(element, options) {
    const defaults = {
      loop: false,
      arrowButtons: false,
      navigator: false,
    };

    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = Object.assign(defaults, options);

    this.elements = {
      arrowButtons: null,
    };

    this.init();
    this.addEvent();

    apply;
    call;
    bind;

    this.element.addEventListener('click', this.onClick.bind(this));
  }

  onClick() {
    this.slide(1);
  }

  createButton(cls, evt, parent) {}

  createArrowButton() {
    let arrowButtonWrap = this.element.querySelector('.btn-wrap');
    if (!arrowButtonWrap) {
      arrowButtonWrap = document.createElement('div');
      arrowButtonWrap.append(arrowButtonWrap);
      arrowButtonWrap.classList.add('.btn-wrap');
    }
    const arrows = {
      prev: this.createButton('.btn-prev', this.slidePrev.bind(this), arrowButtonWrap),
      next: this.createButton('.btn-next', this.slideNext.bind(this), arrowButtonWrap),
    };
    return arrows;
  }

  slidePrev() {}

  init() {
    this.options.arrowButtons && (this.elements.arrowButtons = this.createArrowButton());
  }
  addEvent() {}

  slide(idx) {
    this.element.style.trans();
  }
}

function circleIndex(index, lengs) {
  return (lengs + (index % lengs)) % lengs;
}

const slider = new Slider('.slider', {
  loop: true,
});

slider.slide(1);
