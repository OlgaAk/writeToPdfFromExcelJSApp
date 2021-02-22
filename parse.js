const fs = require("fs");
const tesseract = require("tesseract.js");

let jsonData = {
  invoiceData: [],
};

const imageFilePath = "out.jpg";

const pathToOutputJson = "invoce_data.json";

const testText =
  '0401067\nБАНКОВСКИЙ ОРДЕР № 19 29.01.2021\nДата\nСумма Тридцать рублей 00 копеек Вид оп. 17\nпрописью\n|\nНРВ.Глобал Бизнес ГмбхХ, Санкт- 40807810000002500221 30-00\nПетербургское Представительство компании\nКомиссии за исполнение платежей юр.лиц в | 70601810400002740200\nрублях\nНазначение платежа\n{МО80050}Комиссия за исполнение п/п № 19 от 29.01.21 Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nИсполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\nРоссии по ЦФО\nНаз. пл.: ПОДПИСИ\n';

extractTextFromPdf2Json();

async function extractTextFromPdf2Json() {
  await extractTextFromAllPdfPages();
  writeDataToJson(jsonData);
}

async function extractTextFromAllPdfPages() {
  for (let i = 0; i < 2; i++) {
    //extractTextFromPdfPage(imageFilePath, i);
    updateJsonData(testText, i);
  }
}

function extractTextFromPdfPage(filePath, id) {
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
    jsonData = { invoiceData: [...jsonData.invoiceData, newInvoiceData] };
  } else {
    console.log("not correct doc type");
  }
}

function writeDataToJson(jsonData) {
  const json = JSON.stringify(jsonData);
  fs.writeFileSync(pathToOutputJson, json, "utf-8");
}

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
  return Number(invoiceSum.split("-").join("."));
}

function isCorrectDocType(text) {
  return text.indexOf("БАНКОВСКИЙ ОРДЕР") > -1;
}

module.exports = getInvoiceData; // for testing
