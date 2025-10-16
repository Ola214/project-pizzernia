import { select, classNames, templates } from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

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
        thisProduct.accordionTrigger.addEventListener('click', function (e) {
            /* prevent default action for event */
            e.preventDefault();

            /* find active product (product that has active class) */
            const activeProduct = document.querySelector(select.all.menuProductsActive);

            /* if there is active product and it's not thisProduct.element, remove class active from it */
            if (activeProduct != null && (activeProduct !== thisProduct.element)) {
                activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
            }

            /* toggle active class on thisProduct.element */
            thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        });
    }

    initOrderForm() {

        const thisProduct = this;

        thisProduct.form.addEventListener('submit', function (event) {
            event.preventDefault(); //blokujemy domyślną akcję - wysyłanie formularza z przeładowaniem strony oraz zmianę adresu strony po kliknięciu w link
            thisProduct.processOrder();
        });

        for (let input of thisProduct.formInputs) {
            input.addEventListener('change', function () {
                thisProduct.processOrder();
            });
        }

        for (let input of thisProduct.formBtnsMore) {
            input.addEventListener('click', function () {
                //thisProduct.amountWidget.value = (parseInt(thisProduct.amountWidget.value);
                thisProduct.processOrder();
            });
        }

        for (let input of thisProduct.formBtnsLess) {
            input.addEventListener('click', function () {
                //thisProduct.amountWidget.value = (parseInt(thisProduct.amountWidget.value - 1));
                thisProduct.processOrder();
            });
        }

        thisProduct.cartButton.addEventListener('click', function (event) {
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
        for (let paramId in thisProduct.data.params) {
            //determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'...}
            const param = thisProduct.data.params[paramId];

            // for every option in this category
            for (let optionId in param.options) {

                // TUTAJ DODAJ KOD PIZZY

                // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
                const option = param.options[optionId];


                const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

                const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
                // check if there is param with a name of paramId in formData and if it includes optionId
                if (optionSelected) {
                    // check if the option is not default
                    if (!option.default) {
                        // add option price to price variable
                        price = price + option.price;
                    }

                    if (optionImage) {
                        //Yes! We've found it!
                        optionImage.classList.add(classNames.menuProduct.imageVisible);
                    }
                } else {
                    // check if the option is default
                    if (option.default) {
                        // reduce price variable
                        price = price - option.price;
                    }

                    if (optionImage) {
                        //Yes! We've found it!
                        optionImage.classList.remove(classNames.menuProduct.imageVisible);
                    }
                }
            }
        }
        // update calculated price in the HTML

        thisProduct.priceSingle = price;

        if (thisProduct.amountWidget === undefined) {
            price *= thisProduct.amountWidgetElem.value;
        } else {
            price *= thisProduct.amountWidget.value;
        }

        thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {

        const thisProduct = this;

        //   app.cart.add(thisProduct.prepareCartProduct());

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        });

        thisProduct.element.dispatchEvent(event);
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
        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];

            // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
            params[paramId] = {
                label: param.label,
                options: {}
            }

            // for every option in this categor
            for (let optionId in param.options) {
                const option = param.options[optionId];
                const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

                if (optionSelected) {
                    // option is selected!
                    params[paramId].options[optionId] = option.label;
                }
            }
        }

        return params;
    }
}

export default Product;