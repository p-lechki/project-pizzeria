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
    thisBooking.dom.wrapper.addEventListener('update', function(){
      thisBooking.updateDOM();
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
        thisBooking.selectTable();
        // thisBooking.selectedStarters();
      });

    thisBooking.dom.form.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.makeReservation();
    });

  }

  updateData() {
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
        // thisBooking.selectedStarters();
      });

    thisBooking.dom.form.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.makeReservation();
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

    const date = thisBooking.datePicker.value;
    const hour = utils.hourToNumber(thisBooking.hourPicker.value);

    if(thisBooking.date !== date || thisBooking.hour !== hour) {
      for(let table of thisBooking.dom.tables){
        table.classList.remove('active-table');
      }
    }

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){
      if(thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(parseInt(table.getAttribute('data-table'))) !== -1 ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  selectTable() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.selectTablesArray = [];

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function() {
        if(!table.classList.contains(classNames.booking.tableBooked)){
          table.classList.toggle('active-table');
          thisBooking.newDate = thisBooking.date;
          thisBooking.newHour = thisBooking.hour;
        }
        if (table.classList.contains('active-table')){
          thisBooking.selectTable = table.getAttribute('data-table');
          thisBooking.selectTablesArray.push(thisBooking.selectTable);
        } else {
          thisBooking.selectTablesArray = thisBooking.selectTablesArray.filter(function(item){
            return item != table.getAttribute('data-table');
          });
        }
      });
    }
  }

  makeReservation() {
    const thisBooking = this;

    const url = new URL(settings.db.booking, `http://${settings.db.url}`);

    const reservetion = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectTablesArray.map(function(item) {
        return parseInt(item);
      }),
      duration: parseInt(thisBooking.dom.duration.value),
      ppl: parseInt(thisBooking.dom.people.value),
      starters: [],
    };

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


    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      })
      .then(function(){
        for(let table of thisBooking.dom.tables){
          if(table.classList.contains('active-table')) {
            table.classList.add(classNames.booking.tableBooked);
            table.classList.remove('active-table');
          }
        }
        thisBooking.updateData();
      });
  }

}





