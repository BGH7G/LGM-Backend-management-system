class PermissionError extends Error {
    constructor(message = 'Forbidden', code = 'NO_PERMISSION', status = 403) {
        super(message);
        this.code = code;
        this.statusCode = status;
    }
}

module.exports = (...allowed) => (req, _res, next) => {
    if (!req.user) return next(new PermissionError('请先登录', 'UNAUTHORIZED', 401));

    if (!allowed.includes(req.user.role)) {
        return next(
            new PermissionError(`当前角色(${req.user.role})无权执行此操作`)
        );
    }
    next();
};