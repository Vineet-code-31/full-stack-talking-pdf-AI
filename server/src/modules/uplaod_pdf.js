export const savePDF = async (req, res) => {
  try {
    return res.status(200).json({
      status: 200,
      msg: "file processed successfully",
      fileName: req.file.filename,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      status: 401,
      msg: "Unable to process the file",
    });
  }
};
