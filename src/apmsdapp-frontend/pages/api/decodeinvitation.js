export default async (req, res) => {
    let decodedString
  try {
    decodedString = Buffer.from(
      req.body.encodedinvitation,
      "base64"
    ).toString("utf-8");
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json(decodedString);
};
