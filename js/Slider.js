class Slider {
  constructor(element, options) {
    const defaults = {
      navigation: false,
      pagination: false,
      loop: false,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 300,
    };

    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = Object.assign(defaults, options);
    this.elements = {
      track: this.element.querySelector('.slider__track'),
      slides: this.element.querySelectorAll('.slider__slide'),
      navigation: null,
      pagination: null,
      clones: null,
    };
    this.values = {
      currentIdx: 0,
      currentTransform: 0,
      slideLength: this.elements.slides.length,
      slideLastIdx: this.options.slidesPerView > 1 ? this.elements.slides.length - this.options.slidesPerView : this.elements.slides.length - 1,
      slideWidth: null,
      slideOuterWidth: null,
      totalWidth: null,
    };
    this.check = {
      isSlideMoving: false,
      isTouched: false,
      clickStartX: 0,
      clickStartTime: 0,
      clickXGap: 0,
      clickTimeGap: 0,
    };
    this.init();
    this.addEvent();

    // console.log(this.elements, this.values);
  }

  init() {
    this.values.slideWidth = this.setSlideWidth();
    this.values.slideOuterWidth = this.values.slideWidth + this.options.spaceBetween;
    this.values.totalWidth = this.setTotalWidth();
    this.values.currentTransform = this.options.loop ? -(this.values.slideOuterWidth * this.options.slidesPerView) : 0;

    this.options.loop && (this.elements.clones = this.createClones());
    this.options.navigation && (this.elements.navigation = this.createNavigation()); // 이게 뭐였지...
    this.options.pagination && (this.elements.pagination = this.createPagination());

    this.elements.track.style.transform = `translateX(${this.values.currentTransform}px)`;
    if (this.elements.pagination) this.getCurrentPaging(0);
  }

  addEvent() {
    this.element.addEventListener('pointerdown', this.onMouseDown.bind(this));
    this.element.addEventListener('pointermove', this.onMouseMove.bind(this));
    this.element.addEventListener('pointerup', this.onMouseUp.bind(this));
    this.element.addEventListener('pointerleave', this.onMouseUp.bind(this));
  }

  // --- setting
  setDuration() {
    this.elements.track.style.transitionDuration = `${this.options.speed}ms`;
    setTimeout(() => {
      this.elements.track.style.transitionDuration = '0ms';
      this.check.isSlideMoving = false;
    }, this.options.speed);
  }

  setSlideWidth() {
    let slideWidth = (this.element.offsetWidth - this.options.spaceBetween * (this.options.slidesPerView - 1)) / this.options.slidesPerView;
    for (let i = 0; i < this.elements.slides.length; i++) {
      this.elements.slides[i].style.width = `${slideWidth}px`;
      if (!this.options.spaceBetween == 0) {
        this.elements.slides[i].style.marginRight = `${this.options.spaceBetween}px`;
      }
    }
    return slideWidth;
  }

  setTotalWidth() {
    let lengs = this.options.loop ? this.elements.slides.length + this.options.slidesPerView * 2 : this.elements.slides.length;
    let totalWidth = this.values.slideOuterWidth * lengs;
    this.elements.track.style.width = `${totalWidth}px`;
  }

  // --- clone
  createClones() {
    if (!this.options.loop) return;

    const clones = [];
    for (let i = 0; i < this.options.slidesPerView; i++) {
      clones.push(this.createCloneElem(this.elements.slides[i], this.elements.track, 'last'));
      clones.push(this.createCloneElem(this.elements.slides[this.values.slideLength - i - 1], this.elements.track, 'first'));
    }
    return clones;
  }
  createCloneElem(elem, parent, place) {
    const cloneElem = elem.cloneNode(true);
    cloneElem.setAttribute('aria-hidden', 'true');
    cloneElem.classList.add('slider__slide--clone');
    place == 'first' ? parent.insertBefore(cloneElem, this.elements.track.firstElementChild) : null;
    place == 'last' ? parent.append(cloneElem) : null;
  }

  // --- navigation
  createNavigation() {
    if (this.values.slideLength == 1) return;

    let navigationWrap = this.element.querySelector('.slider__btn');
    if (!navigationWrap) {
      navigationWrap = document.createElement('div');
      navigationWrap.classList.add('slider__btn');
      this.element.append(navigationWrap);
    }
    const arrows = {
      prev: this.createNaviButton('slider__btn--prev', this.onClickPrev.bind(this), navigationWrap),
      next: this.createNaviButton('slider__btn--next', this.onClickNext.bind(this), navigationWrap),
    };
    return arrows;
  }
  createNaviButton(cls, evt, parent) {
    const naviBtn = document.createElement('button');
    naviBtn.setAttribute('type', 'button');
    naviBtn.classList.add(cls);
    naviBtn.addEventListener('click', evt);
    parent.append(naviBtn);
    return naviBtn;
  }

  // --- pagination
  createPagination() {
    if (this.values.slideLength == 1) return;

    let paginationWrap = this.element.querySelector('.slider__pagination');
    if (!paginationWrap) {
      paginationWrap = document.createElement('div');
      paginationWrap.classList.add('slider__pagination');
      this.element.apeend(paginationWrap);
    }
    const bullets = [];
    const bulletsLengs = this.options.loop && this.options.slidesPerView > 1 ? this.values.slideLength : this.values.slideLength - this.options.slidesPerView + 1;
    for (let i = 0; i < bulletsLengs; i++) {
      bullets.push(this.createBullet('slider__pagination__bullet', i, this.onClickPaging.bind(this), paginationWrap));
    }
    return bullets;
  }

  createBullet(cls, idx, evt, parent) {
    const pagiBullet = document.createElement('button');
    pagiBullet.setAttribute('type', 'button');
    pagiBullet.setAttribute('data-index', idx);
    pagiBullet.classList.add(cls);
    pagiBullet.addEventListener('click', evt);
    parent.append(pagiBullet);
    return pagiBullet;
  }

  getCurrentPaging(idx) {
    this.elements.pagination.forEach((item) => {
      item.classList.remove('active');
    });
    this.elements.pagination[idx].classList.add('active');
  }

  // --- slide move
  slideMove(idx) {
    let perView = this.options.slidesPerView;
    let moveValue;
    let tempValue;
    let currentIdx = this.circleIndex(idx);
    if (this.options.loop) {
      moveValue = -((idx + perView) * this.values.slideOuterWidth);
      this.elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;

      if (idx > this.values.slideLength - 1) {
        this.values.currentIdx = 0;
        setTimeout(() => {
          moveValue = -((0 + perView) * this.values.slideOuterWidth);
          this.elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
          this.values.currentTransform = moveValue;
        }, this.options.speed);
      }

      if (idx < -this.options.slidesPerView + 1) {
        this.values.currentIdx = this.values.slideLength - perView;
        setTimeout(() => {
          moveValue = -(this.values.slideLength * this.values.slideOuterWidth);
          this.elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
          this.values.currentTransform = moveValue;
        }, this.options.speed);
      }
    } else {
      moveValue = -(idx * this.values.slideOuterWidth);
      this.elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
    }
    this.values.currentTransform = moveValue;
    this.setDuration();
    if (this.elements.pagination) this.getCurrentPaging(currentIdx);
  }
  slideBack() {
    this.setDuration();
    this.elements.track.style.transform = `translateX(${this.values.currentTransform}px)`;
  }

  // --- click event
  onClickPaging(e) {
    if (this.check.isSlideMoving == true) return;
    const nodes = [...e.target.parentElement.children];
    const idx = nodes.indexOf(e.target);
    this.slideMove(idx);
    this.values.currentIdx = idx;
  }

  onClickPrev() {
    if (this.check.isSlideMoving == true) return;
    if (!this.options.loop && this.values.currentIdx == 0) return this.slideBack();
    this.values.currentIdx--;
    this.check.isSlideMoving = true;

    if (this.options.loop && this.values.currentIdx == this.values.slideLastIdx) {
      this.slideMove(this.values.currentIdx);
    } else {
      this.slideMove(this.values.currentIdx);
    }
  }

  onClickNext() {
    if (this.check.isSlideMoving == true) return;
    if (!this.options.loop && this.values.currentIdx == this.values.slideLastIdx) return this.slideBack();
    this.values.currentIdx++;
    this.check.isSlideMoving = true;

    if (this.options.loop && this.values.currentIdx == 0) {
      this.slideMove(this.values.currentIdx);
    } else {
      this.slideMove(this.values.currentIdx);
    }
  }

  // --- mouse event
  onMouseDown(e) {
    this.check.isTouched = true;
    this.check.clickStartX = e.clientX;
    this.check.clickStartTime = Date.now();
  }
  onMouseMove(e) {
    if (!this.check.isTouched) return;
    if (this.check.isSlideMoving) return;
    this.check.xGap = e.clientX - this.check.clickStartX;
    this.check.TimeGap = Date.now() - this.check.clickStartTime;
    this.elements.track.style.transform = `translateX(${this.values.currentTransform + this.check.xGap}px)`;
  }
  onMouseUp(e) {
    if (!this.check.isTouched) return;
    this.check.isTouched = false;
    this.check.xGap = e.clientX - this.check.clickStartX;
    this.check.TimeGap = Date.now() - this.check.clickStartTime;

    if (Math.abs(this.check.xGap) > 30 || this.check.TimeGap > 500) {
      this.check.xGap > 0 ? this.onClickPrev() : this.onClickNext();

      console.log(this.check.xGap, this.check.TimeGap);
    } else {
      Math.abs(this.check.xGap) > 2 ? this.slideBack() : null;
    }
  }

  // --- etc
  circleIndex(index) {
    let lengs = this.values.slideLength;
    return (lengs + (index % lengs)) % lengs;
  }
}
