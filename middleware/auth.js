function auth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Login required"
        });
    }

    next();
}

module.exports = auth;