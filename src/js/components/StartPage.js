import { templates } from '../settings.js';
import { utils } from '../utils.js';

export class StartPage {
  constructor(page) {
    const thisPage = this;

    // thisPage.page = page;
    thisPage.render(page);
    // thisPage.initSlider();
  }

  render(page) {
    const thisPage = this;

    thisPage.dom = {
      wrapper: page,
    };
    const generateHTML = templates.startPage();
    thisPage.element = utils.createDOMFromHTML(generateHTML);
    thisPage.dom.wrapper.appendChild(thisPage.element);
  }

  // initSlider() {
  //   const thisPage = this;

  //   let slideIndex = 0;
  //   thisPage.showSlides(slideIndex);
  // }

  // showSlides(slideIndex) {
  //   const thisPage = this;

  //   const slides = document.getElementsByClassName('element');
  //   const dots = document.getElementsByClassName('dot');

  //   for (let slide of slides) {
  //     slide.style.display = 'none';
  //   }

  //   slideIndex++;

  //   if (slideIndex > slides.length) {
  //     slideIndex = 1;
  //   }

  //   for (let dot of dots) {
  //     dot.className = dot.className.replace(' active', '');
  //   }

  //   slides[slideIndex - 1].style.display = 'flex';
  //   dots[slideIndex - 1].classList.add('active');

  //   setTimeout(() => {
  //     thisPage.showSlides(slideIndex);
  //   }, 3000);
  // }
}
