export default function createError(status, code, message) {
    const err = new Error(message);
    err.status = !isNaN(status) ? status : 500;
    err.code = code || "internal_server_error";
    return err;
}
