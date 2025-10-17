import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(widgetContainer) {

        this.render(widgetContainer);
    }

    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        thisBooking.dom.peopleAmount = document.getElementsByClassName(select.widgets.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.getElementsByClassName(select.widgets.booking.hoursAmount);

        thisBooking.dom.wrapper.appendChild(thisBooking.element);

        this.initWidgets();
    }

    initWidgets() {
        const thisBooking = this;

        console.log('pa', thisBooking.dom.peopleAmount[0]);

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount[0], this);
        thisBooking.dom.peopleAmount[0].addEventListener('updated', thisBooking.process());

        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount[0], this);
        thisBooking.dom.hoursAmount[0].addEventListener('updated', thisBooking.process());
    }

    process() {
        // const thisBooking = this;


        // thisBooking.dom.peopleAmount.innerHTML = 3;
    }
}

export default Booking;