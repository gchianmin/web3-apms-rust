export default async (req, res) => {
    let decodedString
  try {
    console.log(req.body);
    decodedString = Buffer.from(
      req.body.encodedinvitation,
      "base64"
    ).toString("utf-8");
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("decoded successfully");
  return res.status(200).json(decodedString);
};
