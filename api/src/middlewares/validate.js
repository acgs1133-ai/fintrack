function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Dados inválidos.",
        details: result.error.issues,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
