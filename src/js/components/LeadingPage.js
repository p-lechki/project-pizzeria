import { templates } from '../settings.js';
import { utils } from '../utils.js';

export class LeadingPage {
  constructor(element) {
    const thisPage = this;

    thisPage.element = element;
    thisPage.renderPage(thisPage.element);
    thisPage.initSlider();
  }

  renderPage(element) {
    const thisPage = this;

    thisPage.dom = {
      wrapper: element,
    };

    const generateHTML = templates.leadingPage(thisPage.dom.wrapper);
    const visualElements = utils.createDOMFromHTML(generateHTML);
    element.appendChild(visualElements);

  }

  initSlider() {
    const slideIndex = 0;
    this.showSlides(slideIndex);
  }

  showSlides(slideIndex) {
    const thisPage = this;

    const slides = document.getElementsByClassName('element');
    const dots = document.getElementsByClassName('dot');

    for (let slide of slides) {
      slide.style.display = 'none';
    }

    slideIndex++;

    if (slideIndex > slides.length) {
      slideIndex = 1;
    }

    for (let dot of dots) {
      dot.className = dot.className.replace(' active', '');
    }

    slides[slideIndex - 1].style.display = 'flex';
    dots[slideIndex - 1].classList.add('active');

    setTimeout(() => {
      thisPage.showSlides(slideIndex);
    }, 3000);
  }
}
