import {
  templates,
  select,
  settings,
  classNames
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  AmountWidget
} from './AmountWidget.js';
import {
  DatePicker
} from './DatePicker.js';
import {
  HourPicker
} from './HourPicker.js';



export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.reneder(thisBooking.element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }
  reneder(element) {
    const thisBooking = this;

    thisBooking.dom = {
      wrapper: element,
    };

    const generateHTML = templates.bookingWidget(thisBooking.dom.wrapper);
    const visualElement = utils.createDOMFromHTML(generateHTML);
    element.appendChild(visualElement);

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = element.querySelector(select.booking.form);
    thisBooking.dom.people = element.querySelector('[name="people"]');
    thisBooking.dom.starters = element.querySelectorAll('[name="starter"]');
    thisBooking.dom.duration = element.querySelector('[name="hours"]');
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

  }

  initActions() {
    const thisBooking = this;

    thisBooking.dom.wrapper.addEventListener('update', function () {
      delete thisBooking.tableId;
      thisBooking.updateDOM();
    });

    thisBooking.dom.tables.forEach(function (table) {
      table.addEventListener('click', function () {
        event.preventDefault();
        thisBooking.getTableId(table);
      });
    });

    thisBooking.dom.form.addEventListener('click', function () {
      event.preventDefault();
      thisBooking.checkIfFree();
      thisBooking.makeReservation();
    });
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(thisBooking.datePicker.minDate)}`;
    const endDateParam = `${settings.db.dateEndParamKey} = ${utils.dateToStr(thisBooking.datePicker.maxDate)}`;

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: new URL(
        `${settings.db.booking}?${params.booking.join('&')}`,
        `http://${settings.db.url}`
      ),
      eventsCurrent: new URL(
        `${settings.db.event}?${params.eventsCurrent.join('&')}`,
        `http://${settings.db.url}`
      ),
      eventsRepeat: new URL(
        `${settings.db.event}?${params.eventsRepeat.join('&')}`,
        `http://${settings.db.url}`
      ),
    };

    // console.log('get Data urls: ', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        return Promise.all(allResponses.map(function (response) {
          return response.json();
        }));
      })
      .then(function ([booking, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(booking, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    // console.log('eventsCurrent: ', eventsCurrent);

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }


    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
    // console.log('thisBooking.booked: ', thisBooking.booked);
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    // console.log('Bomb has been planted!');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      tableId = parseInt(tableId);

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  getTableId(table) {
    const thisBooking = this;

    thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);

    !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(thisBooking.tableId)) ?
      table.classList.toggle(classNames.booking.tableBooked) : alert('This table has been booked');

    if (!table.classList.contains(classNames.booking.tableBooked))
      delete thisBooking.tableId;
  }

  makeReservation() {
    const thisBooking = this;

    const url = new URL(settings.db.booking, `http://${settings.db.url}`);

    const reservetion = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.tableId),
      duration: parseInt(thisBooking.dom.duration.value),
      ppl: parseInt(thisBooking.dom.people.value),
      starters: [],
    };

    const temp = parseInt(reservetion.hour);
    console.log('hour to int', temp);

    for (let starter of thisBooking.dom.starters) {
      starter.checked ? reservetion.starters.push(starter.value) : '';
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservetion),
    };

    reservetion.table !== undefined && !isNaN(reservetion.table) ?
      (fetch(url, options)
        .then(function (respons) {
          return respons.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse: ', parsedResponse);
          thisBooking.getData();
        })
      ) : alert('No table has been chosen');
  }

  checkIfFree() {
    const thisBooking = this;

    const url = new URL(settings.db.booking, `http://${settings.db.url}`);
    let reservetionOnCurrentDay = {};

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thisBooking.datePicker.value),
    };

    fetch(url, options)
      .then(function (respons) {
        return respons.json();
      })
      .then(function (parsedResponse) {

        reservetionOnCurrentDay = parsedResponse;
        console.log('reservetionOnCurrentDay: ', reservetionOnCurrentDay);
      });
  }
}





