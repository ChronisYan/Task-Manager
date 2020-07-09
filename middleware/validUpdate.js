const validUpdate = (validFields) => {
  return (req, res, next) => {
    // Allow users to update only specific things
    const fieldsToUpdate = Object.keys(req.body);
    const isValidUpdate = fieldsToUpdate.every((item) => {
      return validFields.includes(item);
    });

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "An invalid field was submitted",
      });
    }

    next();
  };
};

module.exports = validUpdate;
