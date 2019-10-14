/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      thisProduct.removeActive();
      console.log('new Product: ', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on tamplate */
      const generateHTML = templates.menuProduct(thisProduct.data);
      /* create element using utili.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      /* find menu continer */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        thisProduct.removeActive();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        /* find all active products */
        const activeProducts = document.querySelectorAll(classNames.menuProduct.menuProductsActive);
        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }
    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm thisProduct: ', thisProduct);

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;

      // read all data from the form
      const formData = utils.serializeFormToObject(thisProduct.form);
      // set variable price to equal thisProduct.data.price
      let price = thisProduct.data.price;
      // START LOOP: fo each paramId in thisProduct.data.price
      const params = thisProduct.data.params;
      for (let paramId in params) {
        // save the element in thisProduct.data.prams with key pramId as const param
        const param = params[paramId];
        // START LOOP: for each optionId in param.options
        for (let optionId in param.options) {
          // save the element in param.options with key as const option
          const option = param.options[optionId];
          // START IF: if option us selected and option is not default
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if (optionSelected && !option.default) {
            // add price of option to variable price
            price += option.price;
            console.log('price if: ', price);
            // START ELSE IF: if option in not selected and option is default
          } else if (!optionSelected && option.default) {
            // deduct priace of option form price
            price -= option.price;
            console.log('price else if: ', price);
          } // END ELSE IF
          const activeImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          console.log('activeImage: ', activeImage);
          // START IF product is selected and have imgage
          if (optionSelected && activeImage) {
            activeImage.classList.add(classNames.menuProduct.imageVisible);
          } else if (activeImage) {
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        } // END LOOP for each optionId in param.options
      } // END LOOP: for each paramId in thisProduct.data.params
      // set the contents of thisProduct.priceElem to be the value of variable price
      thisProduct.priceElem.innerHTML = price;
    }
    removeActive() {
      const activeElements = document.querySelectorAll(classNames.menuProduct.wrapperActive);
      for (let activeElement of activeElements) {

        activeElement.classList.remove(classNames.menuProduct.wrapperActive);
      }
    }

  }


  const app = {
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
