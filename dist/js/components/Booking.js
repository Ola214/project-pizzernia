import { select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(wrapper) {
    const thisBooking = this;

    thisBooking.selectedTable = null; // wybrany stolik

    thisBooking.getElements(wrapper);
    thisBooking.render();
    thisBooking.initWidgets();
  }

  getElements(wrapper) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
  }

  render() {
    const thisBooking = this;

    // render szablonu Handlebars do wrappera
    thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();

    // teraz możemy pobrać elementy z DOM
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.input);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.hoursAmount);

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector('.floor-plan');
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.widgets.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]');

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('form');
  }

  initWidgets() {
    const thisBooking = this;

    // inicjalizacja AmountWidget
    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount, thisBooking);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount, thisBooking);

    // reset stolika przy zmianie parametrów
    thisBooking.dom.datePicker.addEventListener('change', () => thisBooking.updateDOM());
    thisBooking.dom.hourPicker.addEventListener('change', () => thisBooking.updateDOM());
    thisBooking.dom.peopleAmount.addEventListener('updated', () => thisBooking.updateDOM());
    thisBooking.dom.hoursAmount.addEventListener('updated', () => thisBooking.updateDOM());

    // wybór stolika (event delegation)
    thisBooking.dom.floorPlan.addEventListener('click', (event) => thisBooking.initTables(event));

    // wysyłka rezerwacji
    thisBooking.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!thisBooking.selectedTable) {
        alert('Please select a table!');
        return;
      }
      thisBooking.sendBooking();
    });
  }

  updateDOM() {
    const thisBooking = this;

    // reset wyboru stolika
    if (thisBooking.selectedTable) {
      const selected = thisBooking.dom.floorPlan.querySelector('.table.selected');
      if (selected) selected.classList.remove('selected');
      thisBooking.selectedTable = null;
    }

    // tutaj można dodać aktualizację dostępności stolików (klasa booked)
    // np. thisBooking.dom.tables.forEach(table => { ... });
  }

  initTables(event) {
    const thisBooking = this;
    const clicked = event.target.closest('.table');
    if (!clicked) return;

    if (clicked.classList.contains('booked')) {
      alert('This table is already booked!');
      return;
    }

    // jeśli kliknięto już wybrany stolik → odznacz
    if (clicked.classList.contains('selected')) {
      clicked.classList.remove('selected');
      thisBooking.selectedTable = null;
      return;
    }

    // jeśli inny stolik był wcześniej wybrany → usuń jego klasę
    const previouslySelected = thisBooking.dom.floorPlan.querySelector('.table.selected');
    if (previouslySelected) previouslySelected.classList.remove('selected');

    // zaznacz nowy stolik
    clicked.classList.add('selected');
    thisBooking.selectedTable = clicked.dataset.table;
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.dom.datePicker.value,
      hour: thisBooking.dom.hourPicker.value,
      table: parseInt(thisBooking.selectedTable),
      duration: thisBooking.hoursWidget.value,
      people: thisBooking.peopleWidget.value,
      starters: Array.from(thisBooking.dom.starters)
        .filter(input => input.checked)
        .map(input => input.value),
      phone: thisBooking.dom.wrapper.querySelector('[name="phone"]').value,
      address: thisBooking.dom.wrapper.querySelector('[name="address"]').value,
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(res => res.json())
      .then(parsedResponse => {
        console.log('Booking sent:', parsedResponse);
        alert('Booking confirmed!');
        thisBooking.updateDOM(); // odśwież dostępność stolików jeśli potrzebne
      })
      .catch(err => console.error('Error sending booking:', err));
  }
}

export default Booking;