exports.sendResponseModel = (res, { isError = false, message = '', data = [], status = 200 }) => {

    res.status(status).json({ isError, message, data, status });
    
}; 