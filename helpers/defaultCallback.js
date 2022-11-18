function defaultCallback(res, result, err) {
  if(err) throw(err);
  if(result.success) res.status(200).json(result);
  else res.status(401).json(result);
}

module.exports = defaultCallback;