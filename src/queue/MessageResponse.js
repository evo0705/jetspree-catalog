class MessageResponse {
  constructor(message, success, requeue) {
    this.message = message
    this.success = success
    this.requeue = requeue
  }
}

module.exports = MessageResponse
