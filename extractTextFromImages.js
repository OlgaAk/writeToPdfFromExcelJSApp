const { exception } = require("console");
const fs = require("fs");
const tesseract = require("tesseract.js"); // OCR package

const PATH_TO_OUTPUT_JSON = "invoce_data.json";
const PATH_TO_IMAGES_FOLDER = "out";

//extractTextFromImages();

module.exports = async function extractTextFromImages() {
  cleanOutputJson();
  if (fs.existsSync(PATH_TO_IMAGES_FOLDER)) {
    let files = fs.readdirSync(PATH_TO_IMAGES_FOLDER);
    for (const file of files) {
      if (file.includes("jpg")) await extractTextFromImage(file);
    }
  }
  return true; //tofix
};

async function extractTextFromImage(filePath) {
  await tesseract
    .recognize(PATH_TO_IMAGES_FOLDER + "/" + filePath, "rus", {
      logger: (data) => console.log(data.progress),
    })
    .then(({ data: { text } }) => {
      if (text) {
        updateJsonData(text, filePath);
      } else {
        throw exception("no text found " + text);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function updateJsonData(text, filePath) {
  const id = Number(filePath.split(".")[0]); // number before .jpg extention

  const newInvoiceData = { text, id };
  writeDataToJson(newInvoiceData);
  //jsonData.invoiceData.push(newInvoiceData);
}

function cleanOutputJson() {
  if (fs.existsSync(PATH_TO_OUTPUT_JSON)) {
    fs.rmSync(PATH_TO_OUTPUT_JSON);
  }
}

function writeDataToJson(newInvoiceData) {
  let jsonData = {};
  if (fs.existsSync(PATH_TO_OUTPUT_JSON)) {
    const data = fs.readFileSync(PATH_TO_OUTPUT_JSON);
    const parsedData = JSON.parse(data);
    // get numbers of pdf pages that have been already proceeded and saved to json
    const pageNumbersProceeded = parsedData.invoiceData.map(
      (invoice) => invoice.id
    );
    if (pageNumbersProceeded.indexOf(newInvoiceData.id) == -1) {
      jsonData.invoiceData = [...parsedData.invoiceData, newInvoiceData];
    }
  } else {
    jsonData.invoiceData = [newInvoiceData];
  }
  const json = JSON.stringify(jsonData);
  fs.writeFileSync(PATH_TO_OUTPUT_JSON, json, "utf-8");
}
