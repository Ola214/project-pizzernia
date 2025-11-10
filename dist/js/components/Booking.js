import { templates, select, settings } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(wrapper) {
    const thisBooking = this;

    thisBooking.selectedTable = null; // wybrany stolik
    thisBooking.bookedTables = []; // tablica zajętych stolików

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

    // wstaw szablon Handlebars
    thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();

    // pobierz elementy z DOM
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.widgets.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.widgets.booking.hoursAmount
    );
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector('.floor-plan');
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.widgets.booking.tables
    );
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]');
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('form');

    // ustawienie min i max daty (dzisiaj do +14 dni)
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14);

    thisBooking.dom.datePicker.min = today.toISOString().split('T')[0];
    thisBooking.dom.datePicker.max = maxDate.toISOString().split('T')[0];
    thisBooking.dom.datePicker.value = today.toISOString().split('T')[0];

    // pierwsze pobranie zajętych stolików
    thisBooking.getBookings();
  }

  initWidgets() {
    const thisBooking = this;

    // AmountWidget dla osób i godzin
    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount, thisBooking);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount, thisBooking);

    // reset stolika przy zmianie parametrów
    thisBooking.dom.datePicker.addEventListener('change', () => thisBooking.getBookings());
    thisBooking.dom.hourPicker.addEventListener('change', () => thisBooking.getBookings());
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

    // --- natywny suwak czasu ---
    const hourInput = thisBooking.dom.hourPicker;
    const output = thisBooking.dom.wrapper.querySelector('.hour-picker .output');

    if (hourInput && output) {
      const updateOutput = (value) => {
        const v = parseFloat(value);
        const hours = Math.floor(v);
        const minutes = v % 1 === 0 ? '00' : '30';
        output.textContent = `${hours}:${minutes}`;
      };

      // Ustaw początkową wartość
      updateOutput(hourInput.value);

      // Reakcja na przeciąganie suwaka
      hourInput.addEventListener('input', (e) => {
        updateOutput(e.target.value);
      });

      // Reakcja na puszczenie suwaka
      hourInput.addEventListener('change', (e) => {
        updateOutput(e.target.value);
        thisBooking.getBookings();
      });

      // Aktualizacja po zmianie daty
      thisBooking.dom.datePicker.addEventListener('change', () => {
        updateOutput(hourInput.value);
        thisBooking.getBookings();
      });
    }
  }

  updateDOM() {
    const thisBooking = this;

    // reset wybranego stolika
    if (thisBooking.selectedTable) {
      const selected = thisBooking.dom.floorPlan.querySelector('.table.selected');
      if (selected) selected.classList.remove('selected');
      thisBooking.selectedTable = null;
    }

    // oznacz stoliki zajęte
    thisBooking.dom.tables.forEach((table) => {
      const tableId = parseInt(table.dataset.table);
      if (thisBooking.bookedTables.includes(tableId)) {
        table.classList.add('booked');
      } else {
        table.classList.remove('booked');
      }
    });
  }

  initTables(event) {
    const thisBooking = this;
    const clicked = event.target.closest('.table');
    if (!clicked) return;

    // stolik zajęty
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

  getBookings() {
    const thisBooking = this;
    const date = thisBooking.dom.datePicker.value;
    const hour = thisBooking.dom.hourPicker.value;

    const url = `${settings.db.url}/${settings.db.bookings}?date=${date}&hour=${hour}`;

    fetch(url)
      .then((res) => res.json())
      .then((bookings) => {
        thisBooking.bookedTables = bookings.map((b) => b.table);
        thisBooking.updateDOM();
      })
      .catch((err) => console.error('Error fetching bookings:', err));
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
        .filter((input) => input.checked)
        .map((input) => input.value),
      phone: thisBooking.dom.wrapper.querySelector('[name="phone"]').value,
      address: thisBooking.dom.wrapper.querySelector('[name="address"]').value,
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((parsedResponse) => {
        console.log('Booking sent:', parsedResponse);
        alert('Booking confirmed!');
        thisBooking.getBookings();
      })
      .catch((err) => console.error('Error sending booking:', err));
  }
}

export default Booking;