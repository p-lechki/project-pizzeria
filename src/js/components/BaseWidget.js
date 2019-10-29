export class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {
      wrapper: wrapperElement,
    };

    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(assignedVaule) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedVaule);

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.reanderValue();
  }

  parseValue(newValue) {
    return parseInt(newValue);
  }

  isValid(newValue) {
    return !isNaN(newValue);
  }

  reanderValue() {
    const thisWidget = this;

    console.log('widget value: ', thisWidget.value);
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('update', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
