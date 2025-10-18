  import { settings, select } from '../settings.js';
  import BaseWidget from './BaseWidget.js';

  class AmountWidget extends BaseWidget{
    constructor(element) {
      super(element, settings.amountWidget.defaultValue);

      // this.product = product;
      const thisWidget = this;
      thisWidget.getElements(element);

      // if(thisWidget.dom.input.value) {
      //   thisWidget.setValue(thisWidget.dom.input.value);
      // } else {
      //   thisWidget.setValue(settings.amountWidget.defaultValue);
      // }

      thisWidget.initActions();

      console.log('AmountWidget', thisWidget);
    }

    getElements() {

      const thisWidget = this;

      // thisWidget.dom.wrapper = element;

      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    // parseValue(value){
    //   return parseInt(value);
    // }

    isValid(value){
      return !isNaN(value)
        && value >= settings.amountWidget.defaultMin
        && value <= settings.amountWidget.defaultMax;
    }

    renderValue() {
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value
    }

    initActions() {

      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', () => {
        // thisWidget.setValue(e.target.value);
        thisWidget.value = thisWidget.dom.input.value;
      });

      thisWidget.dom.linkDecrease.addEventListener('click', (e) => {
        e.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.value) - 1);
      });

      thisWidget.dom.linkIncrease.addEventListener('click', (e) => {
        e.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.value) + 1);
      });
    }



  }

  export default AmountWidget;