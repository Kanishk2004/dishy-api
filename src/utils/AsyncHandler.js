// this is a higher order function which takes other function as a parameter and returns a function
// in this case we are using this concept to save us from writing try-catch block again n again while writing controllers

const AsyncHandler = (requestHandler) => {
	return (req, res, next) => {
		Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
	};
};

export { AsyncHandler };
