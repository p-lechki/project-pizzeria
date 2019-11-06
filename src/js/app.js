/* eslint-disable no-undef */

import {
  Product
} from './components/Product.js';
import {
  Cart
} from './components/Cart.js';
import {
  Booking
} from './components/Booking.js';
import {
  select,
  settings,
  classNames
} from './settings.js';
import { LeadingPage } from './components/LeadingPage.js';

const app = {
  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        // console.log('parsedResponse: ', parsedResponse);

        /* save parsedResponse as thisApp.data */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });

    // console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initMenu: function () {
    const thisApp = this;

    // console.log('thisApp.data: ', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initLeadingPage: function () {
    const thisApp = this;

    const leadingPage = document.querySelector(select.containerOf.leadingPage);
    thisApp.leadingPage = new LeadingPage(leadingPage);
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initPages: function () {
    const thisApp = this;

    thisApp.initLeadingPage();

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);

    thisApp.navLinks = [
      ...document.querySelectorAll(select.nav.links),
      ...document.querySelectorAll(select.leadingPage.nav),
    ];

    console.log('leaging page nav: ', thisApp.navLinks);

    let pagesMatchingHash = [];

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* TODO: get page id from href */
        const href = clickedElement.getAttribute('href').replace('#', '');
        /* TODO: activate page */
        thisApp.activatePage(href);
      });
    }
  },

  activatePage(pageId) {
    const thisApp = this;

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.id === pageId);
    }
    console.log('pageId: ', pageId);

    window.location.hash = '#/' + pageId;

    thisApp.hideNavOrCard(pageId);

  },

  initBooking: function () {
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget);
  },

  hideNavOrCard(pageId) {
    const thisApp = this;

    thisApp.cart = document.querySelector(select.containerOf.cart);
    thisApp.nav = document.querySelector(select.containerOf.nav);

    if (pageId === 'leadingPage') {
      thisApp.cart.style.opacity = 0;
      thisApp.nav.style.opacity = 0;
    } else if (pageId === 'booking') {
      thisApp.cart.style.opacity = 0;
      thisApp.nav.style.opacity = 1;
    } else {
      thisApp.cart.style.opacity = 1;
      thisApp.nav.style.opacity = 1;
    }
  },

  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
