
class AppError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = true
        this.status = `${statusCode}`.startsWith('4') ? "Invalid" : "Failed";

    }
}

module.exports = AppError;