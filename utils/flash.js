const { format } = require("util");

// Session-backed flash messages, compatible with req.flash() from connect-flash.
module.exports = function flash() {
  return (req, res, next) => {
    req.flash = function (type, message) {
      if (this.session === undefined) {
        throw new Error("req.flash() requires sessions");
      }

      const messages = (this.session.flash ||= {});

      if (type && message) {
        if (arguments.length > 2) {
          message = format(...Array.prototype.slice.call(arguments, 1));
        } else if (Array.isArray(message)) {
          message.forEach((value) => (messages[type] ||= []).push(value));
          return messages[type].length;
        }

        return (messages[type] ||= []).push(message);
      }

      if (type) {
        const queued = messages[type];
        delete messages[type];
        return queued || [];
      }

      this.session.flash = {};
      return messages;
    };

    next();
  };
};
