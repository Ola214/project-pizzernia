import { select, } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


  class CartProduct {

    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelectorAll(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelectorAll(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelectorAll(select.cartProduct.remove);
    }

    initAmountWidget() {

      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, this);

      thisCartProduct.dom.amountWidget.addEventListener('updated', thisCartProduct.processOrder());
    }

    processOrder() {

      const thisCartProduct = this;

      const formData = utils.serializeFormToObject(thisCartProduct.form);

      // set price to default price
      let price = thisCartProduct.price;

      // for every category (param)
      for(let paramId in thisCartProduct.params) {
        //determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
        const param = thisCartProduct.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {

          // TUTAJ DODAJ KOD PIZZY

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];


          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
            // check if the option is not default
            if(!option.default) {
              // add option price to price variable
              price = price + option.price;
            }
          } else {
            // check if the option is default
            if(option.default) {
              // reduce price variable
              price = price - option.price;
            }
          }
        }
      }
      // update calculated price in the HTML


      if(thisCartProduct.amountWidget === undefined) {
        price = thisCartProduct.priceSingle * parseInt(thisCartProduct.dom.amountWidget.children[1].value);
      } else {
        price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
      }

      thisCartProduct.price = price;
      thisCartProduct.dom.price[0].innerHTML = price;

    }

    initActions() {
      const thisCartProduct = this;

      console.log('CartProduct.initActions', thisCartProduct);

      thisCartProduct.dom.edit[0].addEventListener('click', (e) => {
        e.preventDefault();
      });

      thisCartProduct.dom.remove[0].addEventListener('click', (event) => {
        event.preventDefault();
        console.log('e', event);
        thisCartProduct.remove(event.detail.cartProduct);
      });
    }

    remove(cartProduct) {
     const thisCartProduct = this;

      console.log('cartProduct', cartProduct);

      console.log('CartProduct.remove.thisCartProduct', thisCartProduct);

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    getData() {
      const thisCP = this;

      const thisCartProduct = {};
      thisCartProduct.id = thisCP.id;
      thisCartProduct.amount = thisCP.amountWidget.value;
      thisCartProduct.price = thisCP.price;
      thisCartProduct.priceSingle = thisCP.priceSingle;
      thisCartProduct.name = thisCP.name;
      thisCartProduct.params = thisCP.params;

      return thisCartProduct;
    }
  }

  export default CartProduct;