const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
  next();
};

module.exports = { requireAdmin };
