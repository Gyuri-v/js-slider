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

    this._element = typeof element === 'string' ? document.querySelector(element) : element;
    this._options = Object.assign(defaults, options);
    this._elements = {
      track: this._element.querySelector('.slider__track'),
      slides: this._element.querySelectorAll('.slider__slide'),
      navigation: null,
      pagination: null,
      clones: null,
    };
    this._values = {
      currentIdx: 0,
      currentTransform: 0,
      slideLength: this._elements.slides.length,
      slideLastIdx: this._options.slidesPerView > 1 ? this._elements.slides.length - this._options.slidesPerView : this._elements.slides.length - 1,
      slideWidth: null,
      slideOuterWidth: null,
      totalWidth: null,
    };
    this._check = {
      isSlideMoving: false,
      isTouched: false,
      clickStartX: 0,
      clickStartTime: 0,
      clickXGap: 0,
      clickTimeGap: 0,
    };
    this.init();
    this.addEvent();

    // console.log(this._elements, this._values);
  }

  init() {
    this._values.slideWidth = this.setSlideWidth();
    this._values.slideOuterWidth = this._values.slideWidth + this._options.spaceBetween;
    this._values.totalWidth = this.setTotalWidth();
    this._values.currentTransform = this._options.loop ? -(this._values.slideOuterWidth * this._options.slidesPerView) : 0;

    this._options.loop && (this._elements.clones = this.createClones());
    this._options.navigation && (this._elements.navigation = this.createNavigation());
    this._options.pagination && (this._elements.pagination = this.createPagination());

    this._elements.track.style.transform = `translateX(${this._values.currentTransform}px)`;
    if (this._elements.pagination) this.getCurrentPaging(0);
  }

  addEvent() {
    this._element.addEventListener('mousedown', this.onMouseDown.bind(this));
    this._element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this._element.addEventListener('mouseup', this.onMouseUp.bind(this));
    this._element.addEventListener('mouseleave', this.onMouseUp.bind(this));
    this._element.addEventListener('touchstart', this.onMouseDown.bind(this));
    this._element.addEventListener('touchmove', this.onMouseMove.bind(this));
    this._element.addEventListener('touchend', this.onMouseUp.bind(this));
    this._element.addEventListener('touchleave', this.onMouseUp.bind(this));

    window.addEventListener('resize', () => {
      this.setResize();
    });
  }

  // --- setting
  setResize() {
    this._values.slideWidth = this.setSlideWidth();
    this._values.slideOuterWidth = this._values.slideWidth + this._options.spaceBetween;
    this._values.totalWidth = this.setTotalWidth();
    this._values.currentTransform = -(this._values.slideOuterWidth * this._values.currentIdx) - (this._options.loop ? this._values.slideOuterWidth * this._options.slidesPerView : 0);
    this._elements.track.style.transform = `translateX(${this._values.currentTransform}px)`;
  }

  setDuration() {
    this._elements.track.style.transitionDuration = `${this._options.speed}ms`;
    setTimeout(() => {
      this._elements.track.style.transitionDuration = '0ms';
      this._check.isSlideMoving = false;
    }, this._options.speed);
  }

  setSlideWidth() {
    let slideWidth = (this._element.offsetWidth - this._options.spaceBetween * (this._options.slidesPerView - 1)) / this._options.slidesPerView;
    for (let i = 0; i < this._elements.slides.length; i++) {
      this._elements.slides[i].style.width = `${slideWidth}px`;
      if (!this._options.spaceBetween == 0) {
        this._elements.slides[i].style.marginRight = `${this._options.spaceBetween}px`;
      }
    }
    if (this._elements.clones !== null) {
      for (let i = 0; i < this._elements.clones.length; i++) {
        this._elements.clones[i].style.width = `${slideWidth}px`;
        if (!this._options.spaceBetween == 0) {
          this._elements.clones[i].style.marginRight = `${this._options.spaceBetween}px`;
        }
      }
    }
    return slideWidth;
  }

  setTotalWidth() {
    let lengs = this._options.loop ? this._elements.slides.length + this._options.slidesPerView * 2 : this._elements.slides.length;
    let totalWidth = this._values.slideOuterWidth * lengs;
    this._elements.track.style.width = `${totalWidth}px`;
  }

  // --- clone
  createClones() {
    if (!this._options.loop) return;

    const clones = [];
    for (let i = 0; i < this._options.slidesPerView; i++) {
      clones.push(this.createCloneElem(this._elements.slides[i], this._elements.track, 'last'));
      clones.push(this.createCloneElem(this._elements.slides[this._values.slideLength - i - 1], this._elements.track, 'first'));
    }
    return clones;
  }
  createCloneElem(elem, parent, place) {
    const cloneElem = elem.cloneNode(true);
    cloneElem.setAttribute('aria-hidden', 'true');
    cloneElem.classList.add('slider__slide--clone');
    place == 'first' ? parent.insertBefore(cloneElem, this._elements.track.firstElementChild) : null;
    place == 'last' ? parent.append(cloneElem) : null;

    return cloneElem;
  }

  // --- navigation
  createNavigation() {
    if (this._values.slideLength == 1) return;

    let navigationWrap = this._element.querySelector('.slider__btn');
    if (!navigationWrap) {
      navigationWrap = document.createElement('div');
      navigationWrap.classList.add('slider__btn');
      this._element.append(navigationWrap);
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
    if (this._values.slideLength == 1) return;

    let paginationWrap = this._element.querySelector('.slider__pagination');
    if (!paginationWrap) {
      paginationWrap = document.createElement('div');
      paginationWrap.classList.add('slider__pagination');
      this._element.apeend(paginationWrap);
    }
    const bullets = [];
    const bulletsLengs = this._options.loop && this._options.slidesPerView > 1 ? this._values.slideLength : this._values.slideLength - this._options.slidesPerView + 1;
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
    this._elements.pagination.forEach((item) => {
      item.classList.remove('active');
    });
    this._elements.pagination[idx].classList.add('active');
  }

  // --- slide move
  slideMove(idx) {
    let perView = this._options.slidesPerView;
    let moveValue;
    let tempValue;
    let currentIdx = this.circleIndex(idx);
    if (this._options.loop) {
      moveValue = -((idx + perView) * this._values.slideOuterWidth);
      this._elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;

      if (idx > this._values.slideLength - 1) {
        this._values.currentIdx = 0;
        setTimeout(() => {
          moveValue = -((0 + perView) * this._values.slideOuterWidth);
          this._elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
          this._values.currentTransform = moveValue;
        }, this._options.speed);
      }

      if (idx < -this._options.slidesPerView + 1) {
        this._values.currentIdx = this._values.slideLength - perView;
        setTimeout(() => {
          moveValue = -(this._values.slideLength * this._values.slideOuterWidth);
          this._elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
          this._values.currentTransform = moveValue;
        }, this._options.speed);
      }
    } else {
      moveValue = -(idx * this._values.slideOuterWidth);
      this._elements.track.style.transform = `translate3d(${moveValue}px, 0, 0)`;
    }
    this._values.currentTransform = moveValue;
    this.setDuration();
    if (this._elements.pagination) this.getCurrentPaging(currentIdx);
  }
  slideBack() {
    this.setDuration();
    this._elements.track.style.transform = `translateX(${this._values.currentTransform}px)`;
  }

  // --- click event
  private onClickPaging(e) {
    if (this._check.isSlideMoving == true) return;
    const nodes = [...e.target.parentElement.children];
    const idx = nodes.indexOf(e.target);
    this.slideMove(idx);
    this._values.currentIdx = idx;
  }

  private onClickPrev(slideMoveNum) {
    if (this._check.isSlideMoving == true) return;
    if (!this._options.loop && this._values.currentIdx == 0) return this.slideBack();
    if (typeof slideMoveNum == 'object') {
      this._values.currentIdx--;
    } else {
      this._values.currentIdx -= slideMoveNum;
    }
    this._check.isSlideMoving = true;

    if (this._options.loop && this._values.currentIdx == this._values.slideLastIdx) {
      this.slideMove(this._values.currentIdx);
    } else {
      this.slideMove(this._values.currentIdx);
    }
  }

  private onClickNext(slideMoveNum) {
    if (this._check.isSlideMoving == true) return;
    if (!this._options.loop && this._values.currentIdx == this._values.slideLastIdx) return this.slideBack();
    if (typeof slideMoveNum == 'object') {
      this._values.currentIdx++;
    } else {
      this._values.currentIdx += slideMoveNum;
    }
    this._check.isSlideMoving = true;

    if (this._options.loop && this._values.currentIdx == 0) {
      this.slideMove(this._values.currentIdx);
    } else {
      this.slideMove(this._values.currentIdx);
    }
  }

  // --- mouse event
  onMouseDown(e) {
    this._check.isTouched = true;
    this._check.clickStartX = e.clientX ?? e.changedTouches[0].clientX;
    this._check.clickStartTime = Date.now();
    if (e.target.tagName == 'A' || e.target.tagName == 'BUTTON') {
      e.preventDefault();
    }
  }
  onMouseMove(e) {
    if (!this._check.isTouched) return;
    if (this._check.isSlideMoving) return;
    this._check.xGap = (e.clientX ?? e.changedTouches[0].clientX) - this._check.clickStartX;
    this._check.TimeGap = Date.now() - this._check.clickStartTime;
    this._elements.track.style.transform = `translateX(${this._values.currentTransform + this._check.xGap}px)`;
  }
  onMouseUp(e) {
    if (!this._check.isTouched) return;
    this._check.isTouched = false;
    this._check.xGap = (e.clientX ?? e.changedTouches[0].clientX) - this._check.clickStartX;
    this._check.TimeGap = Date.now() - this._check.clickStartTime;

    if (Math.abs(this._check.xGap) > 50 || this._check.TimeGap > 500) {
      let slideMoveNum = Math.round(Math.abs(this._check.xGap) / this._values.slideOuterWidth);
      slideMoveNum = slideMoveNum == 0 ? 1 : slideMoveNum;

      this._check.xGap > 0 ? this.onClickPrev(slideMoveNum) : this.onClickNext(slideMoveNum);
    } else {
      Math.abs(this._check.xGap) > 2 ? this.slideBack() : null;
    }
  }

  // --- etc
  circleIndex(index) {
    let lengs = this._values.slideLength;
    return (lengs + (index % lengs)) % lengs;
  }
}
