class Slider {
  constructor(sliderElem, option) {
    option.pagination;
    option.navigation;
    option.loop;
    option.slidesPerView;
    option.speed;

    const slider = typeof sliderElem === 'string' ? document.querySelector(sliderElem) : sliderElem;
    const sliderTrack = slider.querySelector('.slider__track');
    const sliderSlide = slider.querySelectorAll('.slider__slide');
    const slideLength = sliderSlide.length;
    const slideTrueLength = option.loop ? slideLength + 2 : slideLength;
    const slideBtns = slider.querySelector('.slider__btn');
    const slidePagination = slider.querySelector('.slider__pagination');
    const slidePaginationBullets = [];
    const slideSpeed = option.speed || 300;
    const slidePerView = option.slidesPerView || 1;
    const spaceBetween = option.spaceBetween || 0;

    let sliderBtnPrev;
    let sliderBtnNext;

    let sliderWidth = 0;
    let slideTrackWidth = 0;
    let slideWidth = 0;
    let slideStartValue = 0;
    let slideEndValue = 0;
    let currentSlide = 0;
    let checkSlideMoving = false;
    let moveTranslateValue = 0;

    const setRending = function () {
      getSliderContentsStyle();

      if (slideLength == 1) return;
      getSliderClone();
      getSliderNavigation();
      getSliderPaginationBullet();
      getSliderCurrentPaging();
    };

    // const setReside = function () {
    //   sliderWidth = slider.offsetWidth;
    //   getSliderContentsStyle();
    //   sliderTrack.style.transform = `translateX(${(currentSlide + 1) * -slideWidth}px)`;
    //   moveTranslateValue = (currentSlide + 1) * -slideWidth;
    // };

    const setSliderTrackDuration = function () {
      sliderTrack.style.transitionDuration = `${slideSpeed}ms`;
      setTimeout(() => {
        sliderTrack.style.transitionDuration = '0ms';
      }, slideSpeed);
    };

    const getSliderClone = function () {
      if (!option.loop) return;

      const firstSlider = sliderTrack.firstElementChild;
      const lastSlider = sliderTrack.lastElementChild;
      const cloneFist = firstSlider.cloneNode(true);
      const cloneLast = lastSlider.cloneNode(true);

      cloneFist.classList.add('slider__slide--clone');
      cloneFist.setAttribute('aria-hidden', 'true');
      cloneLast.classList.add('slider__slide--clone');
      cloneLast.setAttribute('aria-hidden', 'true');

      sliderTrack.appendChild(cloneFist);
      sliderTrack.insertBefore(cloneLast, firstSlider);

      sliderTrack.style.transform = `translateX(${slideStartValue}px)`;
      moveTranslateValue = slideStartValue;
      console.log(moveTranslateValue);
    };

    const getSliderContentsStyle = function () {
      // slider width;
      sliderWidth = slider.offsetWidth;

      // slide width
      for (let i = 0; i < slideLength; i++) {
        slideWidth = (sliderWidth - spaceBetween * (slidePerView - 1)) / slidePerView;
        sliderSlide[i].style.width = slideWidth + 'px';
        sliderSlide[i].style.marginRight = spaceBetween + 'px';
      }

      // slideTrack width
      if (slidePerView == 1) {
        slideTrackWidth = slideTrueLength * slideWidth;
        sliderTrack.style.width = slideTrackWidth + 'px';
      } else {
        slideTrackWidth = slideTrueLength * slideWidth + spaceBetween * slideLength;
        sliderTrack.style.width = slideTrackWidth + 'px';
      }

      // slide start, end Value
      if (option.loop) {
        slideStartValue = -slideWidth;
        if (slidePerView > 1) {
          slideEndValue = -slideTrackWidth + slidePerView * (slideWidth + spaceBetween);
        } else {
          slideEndValue = -slideWidth * slideLength;
        }
      } else {
        slideStartValue = 0;
        if (slidePerView > 1) {
          slideEndValue = -slideTrackWidth + slidePerView * (slideWidth + spaceBetween);
        } else {
          slideEndValue = -slideWidth * slideLength;
        }
      }
    };

    const getSliderNavigation = function () {
      if (!option.navigation) return;

      if (slideLength > 1) {
        sliderBtnPrev = document.createElement('button');
        sliderBtnPrev.setAttribute('type', 'button');
        sliderBtnPrev.classList.add('slider__btn--prev');
        sliderBtnNext = document.createElement('button');
        sliderBtnNext.setAttribute('type', 'button');
        sliderBtnNext.classList.add('slider__btn--next');
        slideBtns.append(sliderBtnPrev);
        slideBtns.append(sliderBtnNext);

        sliderBtnPrev.addEventListener('click', onSliderPrev);
        sliderBtnNext.addEventListener('click', onSliderNext);
      }
    };

    const getSliderPaginationBullet = function () {
      if (!option.pagination) return;

      if (slideLength > 1) {
        for (let i = 0; i < slideLength; i++) {
          const bullet = document.createElement('div');
          bullet.classList.add('slider__pagination__bullet');
          slidePagination.append(bullet);
          slidePaginationBullets.push(bullet);
        }

        slidePaginationBullets.forEach((el, index) => {
          el.addEventListener('click', () => {
            setSliderTrackDuration();
            sliderTrack.style.transform = `translateX(${(index + 1) * slideStartValue}px)`;
            currentSlide = index;
            getSliderCurrentPaging();
          });
        });
      }
    };

    const getSliderCurrentPaging = function () {
      if (!option.pagination) return;

      let currentPaging;

      if (currentSlide >= slideLength) {
        currentPaging = 0;
      } else if (currentSlide < 0) {
        currentPaging = slideLength - 1;
      } else {
        currentPaging = currentSlide;
      }
      slidePaginationBullets.forEach((item) => {
        item.classList.remove('active');
      });
      slidePaginationBullets[currentPaging].classList.add('active');
    };

    const onSliderNext = function (slideMoveNum) {
      const checkSlideEndPoint = slidePerView > 1 ? currentSlide >= slideLength - slidePerView : currentSlide >= slideLength - 1;

      if (slideLength == 1) return;
      if (checkSlideMoving) {
        sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;
        return;
      }
      if (!option.loop && checkSlideEndPoint) {
        setSliderTrackDuration();
        sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;
        return;
      }

      checkSlideMoving = true;
      moveTranslateValue -= slideWidth + spaceBetween;
      slideMoveNum > 1 ? (currentSlide += slideMoveNum) : currentSlide++;
      sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;

      // moveTranslateValue < slideEndValue ? (moveTranslateValue = slideEndValue) : moveTranslateValue;
      // slideMoveNum > 1 ? (currentSlide += slideMoveNum) : currentSlide++;
      // currentSlide > slideLength - 1 ? (currentSlide = slideLength - 1) : currentSlide;
      // console.log('slideEndValue' + slideEndValue, currentSlide, moveTranslateValue);

      setTimeout(() => {
        if (checkSlideEndPoint) {
          moveTranslateValue = slideStartValue;
          sliderTrack.style.transform = `translateX(${slideStartValue}px)`;
          currentSlide = 0;
        }
        checkSlideMoving = false;
      }, slideSpeed);

      setSliderTrackDuration();
      getSliderCurrentPaging();
    };

    const onSliderPrev = function (slideMoveNum) {
      const checkSlideEndPoint = currentSlide === 0;

      if (slideLength == 1) return;
      if (checkSlideMoving) {
        sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;
        return;
      }
      if (!option.loop && checkSlideEndPoint) {
        setSliderTrackDuration();
        sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;
        return;
      }

      checkSlideMoving = true;
      moveTranslateValue += slideWidth + spaceBetween;
      slideMoveNum > 1 ? (currentSlide -= slideMoveNum) : currentSlide--;
      sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;

      // moveTranslateValue > 0 ? (moveTranslateValue = 0) : moveTranslateValue;
      // currentSlide < 0 ? (currentSlide = 0) : currentSlide;

      setTimeout(() => {
        if (checkSlideEndPoint) {
          moveTranslateValue = slideEndValue;
          sliderTrack.style.transform = `translateX(${slideEndValue}px)`;
          currentSlide = slideLength - 1;
        }
        checkSlideMoving = false;
      }, slideSpeed);

      setSliderTrackDuration();
      getSliderCurrentPaging();
    };

    // drag & touch 체크
    let isTouched = false;
    let clickStartX;
    let clickStartTime;
    let xGap;
    let timeGap;
    let currentSliderTransform;

    const onMouseDown = function (e) {
      isTouched = true;
      clickStartX = e.clientX;
      clickStartTime = Date.now();
      currentSliderTransform = sliderTrack.style.transform ? +sliderTrack.style.transform.split('(')[1].split('p')[0] : 0;
    };

    const onMouseMove = function (e) {
      if (!isTouched) return;
      xGap = e.clientX - clickStartX;
      sliderTrack.style.transform = `translateX(${currentSliderTransform + xGap}px)`;
    };

    const onMouseUp = function (e) {
      if (!isTouched) return;

      isTouched = false;
      timeGap = Date.now() - clickStartTime;

      if (slideLength == 1) {
        sliderTrack.style.transform = `translateX(0px)`;
        setSliderTrackDuration();
      }

      if (Math.abs(xGap) > 20 || timeGap > 500) {
        let slideMoveNum = Math.round(Math.abs(xGap) / slideWidth);
        slideMoveNum == 0 ? (slideMoveNum = 1) : slideMoveNum;
        if (slideLength > 1) {
          if (xGap < 0) {
            onSliderNext(slideMoveNum);
          } else if (xGap > 0) {
            onSliderPrev(slideMoveNum);
          }
        }
      } else {
        setSliderTrackDuration();
        sliderTrack.style.transform = `translateX(${moveTranslateValue}px)`;
      }

      document.removeEventListener('pointerdown', onMouseDown);
      document.removeEventListener('pointermove', onMouseMove);
    };

    window.addEventListener('load', setRending);
    // window.addEventListener('resize', setReside);

    slider.addEventListener('pointerdown', onMouseDown);
    slider.addEventListener('pointermove', onMouseMove);
    document.addEventListener('pointerup', onMouseUp);
    document.addEventListener('pointerleave', onMouseUp);
  }
}
