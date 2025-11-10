import { templates, select } from '../settings.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;
    thisHome.wrapper = wrapper || document.querySelector(select.containerOf.home);
    if (!thisHome.wrapper) return;

    thisHome.render();
    thisHome.initWidgets();
  }

  render() {
    const thisHome = this;
    thisHome.wrapper.innerHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.orderBox = thisHome.wrapper.querySelector('.home-order');
    thisHome.dom.bookingBox = thisHome.wrapper.querySelector('.home-booking');
    thisHome.dom.carouselSlides = thisHome.wrapper.querySelectorAll('.carousel-cell');

    thisHome.currentSlide = 0;
    thisHome.dom.carouselSlides.forEach((slide, i) => {
      slide.style.opacity = i === 0 ? '1' : '0';
      slide.style.position = 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';
      slide.style.transition = 'opacity 1s ease-in-out';
    });
  }

  initWidgets() {
    const thisHome = this;

    // Carousel fade
    if (thisHome.dom.carouselSlides.length > 0) {
      setInterval(() => {
        thisHome.dom.carouselSlides[thisHome.currentSlide].style.opacity = '0';
        thisHome.currentSlide = (thisHome.currentSlide + 1) % thisHome.dom.carouselSlides.length;
        thisHome.dom.carouselSlides[thisHome.currentSlide].style.opacity = '1';
      }, 3000);
    }

    // Kliknięcie boxów
    const activatePage = id => {
      const navLink = document.querySelector(`.main-nav a[href="#${id}"]`);
      if (navLink) navLink.click();
      else window.location.hash = `#${id}`;
    };

    if (thisHome.dom.orderBox) thisHome.dom.orderBox.addEventListener('click', () => activatePage('order'));
    if (thisHome.dom.bookingBox) thisHome.dom.bookingBox.addEventListener('click', () => activatePage('booking'));
  }
}

export default Home;