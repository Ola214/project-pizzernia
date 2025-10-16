import { select, settings, templates, classNames } from './settings.js';
import utils from './utils.js';
import CartProduct from './components/CartProduct.js';

 class Cart {

    constructor(element) {

      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', (event) => {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener("submit", (event) => {
        event.preventDefault(); // wysyłka formularza nie będzie przeładowywała strony
        thisCart.sendOrder();
      })
    }

    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.dom.totalPrice.innerHTML,
        subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
        totalNumber: thisCart.dom.totalNumber.innerHTML,
        deliveryFee: thisCart.dom.deliveryFee.innerHTML,
        products: []
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    }

    remove(cartProduct) {


      cartProduct.dom.wrapper.remove();

      //cartProduct = {};

      const cartProductId = cartProduct.id;

      const thisCart = this;

      for(let productNum = 0; productNum < (thisCart.products.length); productNum++) {
        if(thisCart.products[productNum].id == cartProductId) {
          thisCart.products.splice(productNum, 1);
        }
      }


      thisCart.update();
    }

    add(menuProduct){
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);


      /* create element using utils.createelementFromHHTML */
      thisCart.element = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(thisCart.element);

      thisCart.products.push(new CartProduct(menuProduct, thisCart.element));

      thisCart.update();
    }

    update() {
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;
      let subtotalPrice = 0;



      for(let product of thisCart.products) {

         totalNumber += product.amountWidget.value;
         subtotalPrice += product.priceSingle * product.amountWidget.value;

        //  totalNumber += product.children[0].children[1].value;
        //  subtotalPrice += parseInt(product.children[1].children[0].children[1].children[0].innerHTML);

      }
      if(totalNumber != 0){
        thisCart.totalPrice = deliveryFee + subtotalPrice;
      }
      if(thisCart.products.length == 0){
        thisCart.totalPrice = 0;
      }

      thisCart.dom.wrapper.querySelector('.cart__order-subtotal .cart__order-price-sum').innerHTML = `$ ${subtotalPrice}`;
      thisCart.dom.wrapper.querySelector('.cart__order-delivery .cart__order-price-sum').innerHTML = `$ ${deliveryFee}`;
      thisCart.dom.wrapper.querySelector('.cart__order-total .cart__order-price-sum').innerHTML = `$ ${thisCart.totalPrice}`;

      thisCart.dom.wrapper.querySelector('.cart__summary .cart__total-price strong').innerHTML = ` ${thisCart.totalPrice}`;
      thisCart.dom.wrapper.querySelector('.cart__summary .cart__total-number').innerHTML = `${totalNumber}`;

    }


  }

  export default Cart;