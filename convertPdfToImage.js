const spawn = require("child_process").spawn; // run python script from node (pdf to image) for better quality

module.exports = function convertPdfToImage(pathToPdf) {
  const pythonProcess = spawn("python3", ["parse.py", pathToPdf]); // takes pdf path as argument

  pythonProcess.stdout.on("data", function (data) {
    console.log(String.fromCharCode.apply(null, data));
    if (data === "success") return true;
  });
  pythonProcess.stderr.on("data", (data) => {
    console.log(String.fromCharCode.apply(null, data));
  });
};
