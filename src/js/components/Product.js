import {
  select,
  classNames,
  templates
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  AmountWidget
} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    // console.log('new Product: ', thisProduct);
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
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
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
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */

      /* END: click event listener to trigger */

    });
  }

  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderForm thisProduct: ', thisProduct);

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
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  processOrder() {
    const thisProduct = this;

    // read all data from the form
    const formData = utils.serializeFormToObject(thisProduct.form);
    // set variable price to equal thisProduct.data.price
    thisProduct.params = {};
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
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {}
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          // add price of option to variable price
          price += option.price;
          // console.log('price if: ', price);
          // START ELSE IF: if option in not selected and option is default
        } else if (!optionSelected && option.default) {
          // deduct priace of option form price
          price -= option.price;
          // console.log('price else if: ', price);
        } // END ELSE IF
        const activeImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        // console.log('activeImage: ', activeImage);
        // START IF product is selected and have imgage
        if (optionSelected && activeImage) {
          activeImage.classList.add(classNames.menuProduct.imageVisible);
        } else if (activeImage) {
          activeImage.classList.remove(classNames.menuProduct.imageVisible);
        }
      } // END LOOP for each optionId in param.options
    } // END LOOP: for each paramId in thisProduct.data.params
    // set the contents of thisProduct.priceElem to be the value of variable price
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    // console.log('thisProduct.params: ', thisProduct.params);
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}
