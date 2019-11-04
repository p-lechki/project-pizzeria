/* eslint-disable no-undef */

import { StartPage } from './components/StartPage.js';
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
        console.log('parsedResponse: ', parsedResponse);

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


  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initStartPage: function () {
    const thisApp = this;

    const startPage = document.querySelector(select.containerOf.startPage);

    thisApp.startPage = new StartPage(startPage);
  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);

    thisApp.links = Array.from(document.querySelectorAll('.link'));
    console.log('links: ', thisApp.links);

    thisApp.navLinks = [
      ...document.querySelectorAll('.link'),
      ...document.querySelectorAll(select.nav.links),
      ...document.querySelectorAll('.startPage a')
    ];
    console.log('navlinks: ', thisApp.navLinks);

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

    window.location.hash = '#' + pageId;
  },

  initBooking: function () {
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget);
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
    thisApp.initStartPage();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
