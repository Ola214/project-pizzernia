  import { settings, select } from '../settings.js';

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

      this.product.process();

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

  export default AmountWidget;