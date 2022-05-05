const slider1 = new Slider('.example-1 .slider', {
  pagination: true,
  navigation: true,
  loop: true,
  slidesPerView: 1,
  speed: 200,
});
const slider2 = new Slider('.example-2 .slider', {
  pagination: true,
  navigation: true,
  loop: true,
  slidesPerView: 4,
  spaceBetween: 30,
  speed: 300,
});
const slider3 = new Slider('.example-3 .slider', {
  pagination: false,
  navigation: false,
  loop: false,
  slidesPerView: 1,
  speed: 500,
});
