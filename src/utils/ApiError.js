// this is to standardise the error response from the api
// this functionality is built-in in the node so this class just extends it

// class ApiError extends Error {
// 	constructor(
//         statusCode,
//         message = "Something went wrong",
//         errors = [],
//         stack = ""
//         ) {
// 		super(message)
//         this.statusCode = statusCode
//         this.data = null
//         this.message = message
//         this.success = false
//         this.errors = errors;

//         if (stack) {
//             this.stack = stack
//         } else {
//             Error.captureStackTrace(this, this.constructor)
//         }
// 	}
// }

class ApiError {
	constructor(statuscode, message = 'Something went wrong', data = []) {
		this.statuscode = statuscode;
		this.message = message;
		this.data = [];
		this.success = false;
	}
}

export { ApiError };
