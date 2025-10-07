export default function errorHandler(err, req, res, _next) {
    const status = err.status && !isNaN(err.status) ? err.status : 500;
    const code = err.code || "internal_server_error";
    const message = err.message || "An unexpected error occurred";
    res.status(status).send({ message, code: req.__(code) });
}
