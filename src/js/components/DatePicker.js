/* eslint-disable no-undef */

import {
  BaseWidget
} from './BaseWidget.js';
import {
  utils
} from '../utils.js';
import {
  select,
  settings
} from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wraper) {
    super(wraper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.wraper = wraper;
    thisWidget.dom.input = thisWidget.dom.wraper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }


  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    const daysInFuture = settings.datePicker.maxDaysInFuture;
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, daysInFuture);

    const options = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function (date) {
          return (date.getDay() === 1);
        }
      ],

      local: {
        firstDayOfWeek: 1,
      },
      onChange: function (dateStr) {
        thisWidget.value = dateStr[0] ? utils.dateToStr(dateStr[0]) : false;
        thisWidget.reanderValue;
      }
    };

    flatpickr(thisWidget.dom.input, options);
  }

  parseValue(newValue) {
    return newValue;
  }

  isValid() {
    return true;
  }

  reanderValue() { }

}
