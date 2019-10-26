import {
  templates,
  select,
  settings
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
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params: ', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.repeatParam,
    };

    console.log('get Data urls: ', urls);

    Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat),
      ])
      .then(function ([bookingResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([booking, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(booking, eventsCurrent, eventsRepeat);
      });
  }

  parseData(booking, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    console.log(thisBooking.booked);

    for (let item of booking) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
      }
    }


  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlocked = startHour; hourBlocked < startHour + duration; hourBlocked += 0.5) {
      if (typeof thisBooking.booked[date][startHour] == 'undefined') {
        thisBooking.booked[date][startHour] = [];
      }
      thisBooking.booked[date][startHour].push(table);
    }
  }

}
