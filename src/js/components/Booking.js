import { templates } from '../settings.js';
import utils from '../utils.js';

class Booking {
    constructor(widgetContainer) {
        const thisBooking = this;
        thisBooking.widgetContainer = widgetContainer;
        this.render(thisBooking.widgetContainer);
    }

    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        thisBooking.dom.wrapper.appendChild(thisBooking.element);

        this.initWidgets();
    }

    initWidgets() {

    }
}

export default Booking;