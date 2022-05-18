function Slider(element, option) {
  let _element;

  const _init = function() {
    _element = typeof element === 'string' ? document.querySelector(element) : element;

    BindEvent();
    
    return this;
  }

  // private
  const BindEvent = function() {
    _element.addEventListener('pointer')
  };


  return {
    element: element,
    init: _init
  }
}

const oSlider = new Slider();

oSlider.init();