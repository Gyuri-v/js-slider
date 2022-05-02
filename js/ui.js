import Slider from './Slider.js';

const ex1Slider = document.querySelector('.example-1 .slider');
const ex2Slider = document.querySelector('.example-2 .slider');
const ex3Slider = document.querySelector('.example-3 .slider');

const slider1 = new Slider(ex1Slider, {
  pagination: true,
  navigation: true,
  loop: true,
  slidesPerView: 1,
  speed: 300,
});
const slider2 = new Slider(ex2Slider, {
  pagination: false,
  navigation: true,
  loop: false,
  slidesPerView: 4,
  spaceBetween: 30,
  speed: 800,
});
const slider3 = new Slider(ex3Slider, {
  pagination: false,
  navigation: false,
  loop: false,
  slidesPerView: 1,
  speed: 500,
});
