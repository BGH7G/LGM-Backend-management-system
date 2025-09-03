const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

module.exports.verifyToken = function (required = true) {
    //  为有无token设计不同的数据获取验证
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null
        if (token) {
            try {
                const decoded = jwt.verify(token, secret);
                req.user = decoded.userInfo;
                next();
            } catch (error) {
                console.error("JWT Verification Error:", error);
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({msg: 'Unauthorized: Token expired'});
                } else if (error.name === 'JsonWebTokenError') {
                    return res.status(401).json({msg: 'Unauthorized: Invalid token'});
                } else {
                    return res.status(401).json({msg: 'Unauthorized: ' + error.message});
                }
            }
        } else if (required) {
            return res.status(401).json({msg: 'Please enter token'});
        } else {
            next()
        }
    }
}

module.exports.createToken = async userInfo => {
    return jwt.sign(
        {userInfo},
        `${secret}`,
        {
            expiresIn: 60 * 60 * 24,
            issuer: 'bghong7g'
        }
    );
}

/**
 * 可选鉴权：有 token 就解析并把 user 挂到 req；无 token 直接放行
 */
exports.optionalToken = () => (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next();               // 无 token => 匿名
    const token = auth.split(' ')[1];
    jwt.verify(token, secret, (err, decoded) => {
        if (!err) req.user = decoded;         // 解析成功则携带 user 信息
        // 解析失败也直接放行，保持只读接口可用
        return next();
    });
};