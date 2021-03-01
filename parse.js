const fs = require("fs");
const tesseract = require("tesseract.js"); // OCR package
const spawn = require("child_process").spawn; // run python script from node (pdf to image) for better quality

convertPdfToImage();

function convertPdfToImage() {
  const pythonProcess = spawn("python3", ["parse.py", "report1.pdf"]); // takes pdf path as argument

  pythonProcess.stdout.on("data", function (data) {
    console.log(String.fromCharCode.apply(null, data));
    if (data === "success") return true;
  });
  pythonProcess.stderr.on("data", (data) => {
    console.log(String.fromCharCode.apply(null, data));
  });
}

// stores parsed data before writing to json file
let jsonData = {
  invoiceData: [],
};

const imageFilePath = "out.jpg"; // should be made dynamic
const pathToOutputJson = "invoce_data.json";

// Mock Data to substitute Tesseract job
const testText =
  '0401067\nБАНКОВСКИЙ ОРДЕР № 19 29.01.2021\nДата\nСумма Тридцать рублей 00 копеек Вид оп. 17\nпрописью\n|\nНРВ.Глобал Бизнес ГмбхХ, Санкт- 40807810000002500221 30-00\nПетербургское Представительство компании\nКомиссии за исполнение платежей юр.лиц в | 70601810400002740200\nрублях\nНазначение платежа\n{МО80050}Комиссия за исполнение п/п № 19 от 29.01.21 Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nИсполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\nРоссии по ЦФО\nНаз. пл.: ПОДПИСИ\n';

/// END Globals

//runs code
extractTextFromAllImages();

// Gets text data from each Pdf page, stores it in the global variable and finally writes it to a json file
async function extractTextFromImage2Json() {
  await extractTextFromAllImages();
}

async function extractTextFromAllImages() {
  for (let i = 0; i < 2; i++) {
    updateJsonData(testText, i);
    //extractTextFromImage(filePath, i)
    writeDataToJson();
  }
}

function extractTextFromImage(filePath, id) {
  tesseract
    .recognize(filePath, "rus", {
      logger: (data) => console.log(data.progress),
    })
    .then(({ data: { text } }) => {
      updateJsonData(text, id);
    })
    .catch((error) => {
      console.log(error);
    });
}

function updateJsonData(text, id) {
  if (isCorrectDocType(text)) {
    let newInvoiceData = getInvoiceData(text, id);
    jsonData.invoiceData.push(newInvoiceData);
  } else {
    console.log("not correct doc type");
  }
}

function writeDataToJson() {
  if (fs.existsSync(pathToOutputJson)) {
    const data = fs.readFileSync(pathToOutputJson);
    const parsedData = JSON.parse(data);
    // get numbers of pdf pages that have been already proceeded and saved to json
    const pageNumbersProceeded = parsedData.invoiceData.map(
      (invoice) => invoice.id
    );
    // If pdf page has been already proceeded don't add it again to json
    const filteredDataWithoutRepetitions = jsonData.invoiceData.filter(
      (invoice) => {
        return !pageNumbersProceeded.includes(invoice.id);
      }
    );
    jsonData.invoiceData = [
      ...parsedData.invoiceData,
      ...filteredDataWithoutRepetitions,
    ];
  }
  const json = JSON.stringify(jsonData);
  fs.writeFileSync(pathToOutputJson, json, "utf-8");
}

// Gets needed substrings from text
function getInvoiceData(text, id) {
  const invoiceDate = getInvoiceDateFromString(text);
  const invoiceSum = getInvoiceSumFromString(text);
  const invoiceSumInt = convertInvoiceSumToInt(invoiceSum);
  return {
    id,
    invoiceDate,
    invoiceSumInt,
    text,
  };
}

function getInvoiceDateFromString(text) {
  if (text.indexOf("Дата") > -1) {
    return text.substr(text.indexOf("Дата") - 11, 10);
  } else return null;
}

function getInvoiceSumFromString(text) {
  if (
    // sum is placed between two following substrings
    text.indexOf("40807810000002500221") > -1 &&
    text.indexOf("Петербургское Представительство компании") > -1
  ) {
    return text
      .substring(
        text.indexOf("40807810000002500221") + "40807810000002500221".length,
        text.indexOf("Петербургское Представительство компании")
      )
      .trim();
  } else return null;
}

function convertInvoiceSumToInt(invoiceSum) {
  return Number(invoiceSum.split("-").join(".")); // input format is dd-dd
}

function isCorrectDocType(text) {
  // only doc with this substring are parsed
  return text.indexOf("БАНКОВСКИЙ ОРДЕР") > -1;
}

module.exports = getInvoiceData; // for testing
