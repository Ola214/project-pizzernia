/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
      formBtnsLess: `.btn-quantity[href='#less']`,
      formBtnsMore: `.btn-quantity[href='#more']`,
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
      // CODE ADDED START


    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum',
      subtotalPrice: 'li.cart__order-subtotal > span.cart__order-price-sum',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: "//localhost:3131",
      products: 'products',
      orders: 'orders',
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {

      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createelementFromHHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {

      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.formBtnsLess = thisProduct.form.querySelectorAll(select.all.formBtnsLess);
      thisProduct.formBtnsMore = thisProduct.form.querySelectorAll(select.all.formBtnsMore);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget() {

      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, this);

      thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
    }

    initAccordion() {

      const thisProduct = this;

        /* START: add event listener to clickable trigger on event click*/
      thisProduct.accordionTrigger.addEventListener('click', function(e) {
        /* prevent default action for event */
        e.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct != null && (activeProduct !== thisProduct.element)) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive) ;
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm() {

      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault(); //blokujemy domyślną akcję - wysyłanie formularza z przeładowaniem strony oraz zmianę adresu strony po kliknięciu w link
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      for(let input of thisProduct.formBtnsMore) {
        input.addEventListener('click', function() {
          //thisProduct.amountWidget.value = (parseInt(thisProduct.amountWidget.value);
          thisProduct.processOrder();
        });
      }

      for(let input of thisProduct.formBtnsLess) {
        input.addEventListener('click', function() {
          //thisProduct.amountWidget.value = (parseInt(thisProduct.amountWidget.value - 1));
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {

      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)
      for(let paramId in thisProduct.data.params) {
        //determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {

          // TUTAJ DODAJ KOD PIZZY

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];


          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
            // check if the option is not default
            if(!option.default) {
              // add option price to price variable
              price = price + option.price;
            }

            if(optionImage) {
              //Yes! We've found it!
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            // check if the option is default
            if(option.default) {
              // reduce price variable
              price = price - option.price;
            }

            if(optionImage) {
              //Yes! We've found it!
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      // update calculated price in the HTML

      thisProduct.priceSingle = price;

      if(thisProduct.amountWidget === undefined) {
        price *= thisProduct.amountWidgetElem.value;
      } else {
        price *= thisProduct.amountWidget.value;
      }

      thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {

      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {

      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };

      return productSummary;
    }

    prepareCartProductParams() {

      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }

        // for every option in this categor
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            // option is selected!
           params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor(element, product) {

      this.product = product;
      const thisWidget = this;
      thisWidget.getElements(element);

      if(thisWidget.input.value) {
        thisWidget.setValue(thisWidget.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }

      thisWidget.initActions();
    }

    getElements(element) {

      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {

      const thisWidget = this;


      const newValue = parseInt(value);

      /* TODO: Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;

        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;

      this.product.processOrder();

    }

    initActions() {

      const thisWidget = this;

      thisWidget.input.addEventListener('change', (e) => {thisWidget.setValue(e.target.value);});

      thisWidget.linkDecrease.addEventListener('click', (e) => {
        e.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.value) - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', (e) => {
        e.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.value) + 1);
      });
    }

    announce(){

      const thisWidget = this;

      const event = new Event('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);

    }

  }

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

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function() {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parseResponse){
          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parseResponse;

          /* execute initMenu method */
          thisApp.initMenu();
        });
    },
    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      // thisApp.initMenu();
      thisApp.initCart();
    },

  };

  app.init();
}

