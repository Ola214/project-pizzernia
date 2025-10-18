class BaseWidget{
    constructor(wrapperElement, initialValue){

        console.log('initialValue', initialValue);
        const thisWidget = this;

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.correctValue = initialValue;
        console.log('thisWidget.correctValue', thisWidget.dom.input);
        // thisWidget.dom.input.innerHTML = initialValue;
    }

    get value(){
        const thisWidget = this;

        return thisWidget.correctValue;
    }

    set value(value) {

      const thisWidget = this;


      const newValue = thisWidget.parseValue(value);

      /* TODO: Add validation */
      if(thisWidget.correctValue !== newValue && !isNaN(newValue) && thisWidget.isValid(newValue)) {
        thisWidget.correctValue = newValue;

        thisWidget.announce();
      }

      // thisWidget.dom.input.value = thisWidget.correctValue;

      // this.product.process();

      thisWidget.renderValue();

    }

    setValue(value){
        const thisWidget = this;

        thisWidget.value = value;
    }

    parseValue(value){
      return parseInt(value);
    }

    isValid(value){
      return !isNaN(value);
    }

    renderValue(){
        const thisWidget = this;

        thisWidget.dom.input.innerHTML = thisWidget.correctValue;
    }


    announce(){

      const thisWidget = this;

      const event = new Event('updated', {
        bubbles: true
      });
      thisWidget.dom.wrapper.dispatchEvent(event);

    }
}

export default BaseWidget;