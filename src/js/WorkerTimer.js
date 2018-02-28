class WorkerTimer {
  onmessage(event) {
    setTimeout(() => {
      postMessage({ args: event.data.args });
    }, event.data.delay);
  }
}

module.exports = WorkerTimer;