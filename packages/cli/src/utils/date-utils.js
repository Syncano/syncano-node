function currentTime() {
  return (new Date()).toTimeString().slice(0, 8);
}

class Timer {
  constructor() {
    this.reset();
  }
  reset() {
    this.startTime = new Date().getTime();
  }
  getDurationTime() {
    return new Date().getTime() - this.startTime;
  }
  getDuration() {
    return `${this.getDurationTime()} ms`;
  }
}


export default {
  currentTime,
  Timer
};
