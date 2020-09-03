function dayStringToNumber(dayString) {
  let weekday = ['Sunday',
  'Monday',
  'Tuesdat',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday']

    return (weekday.indexOf(dayString));
  }

console.log(  dayStringToNumber('Monday'))