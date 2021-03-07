const spawn = require("child_process").execSync; // run python script from node (pdf to image) for better quality

module.exports = async function convertPdfToImage(pathToPdf) {
  //   const pythonProcess = spawn("python3", ["parse.py", pathToPdf]); // takes pdf path as argument

  var result = spawn("python3 parse.py " + pathToPdf);

  //   pythonProcess.stdout.on("data", async function (data) {
  //     console.log(String.fromCharCode.apply(null, data));
  //     if (data === "success") return true;
  //     pythonProcess.kill();
  //   });
  //   pythonProcess.stderr.on("data", async (data) => {
  //     console.log(String.fromCharCode.apply(null, data));
  //     result = false;
  //   });

  return String.fromCharCode.apply(null, result);
};
