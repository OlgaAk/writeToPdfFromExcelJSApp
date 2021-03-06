const { exception } = require("console");
const fs = require("fs");
const tesseract = require("tesseract.js"); // OCR package

const PATH_TO_OUTPUT_JSON = "invoce_data.json";
const PATH_TO_IMAGES_FOLDER = "out";

const invoiceTypesEnum = { "БАНКОВСКИЙ ОРДЕР": 1, "ПЛАТЕЖНОЕ ПОРУЧЕНИЕ": 2 }; // todo use typescript

// Mock Data to substitute Tesseract job
const testText =
  '0401067\nБАНКОВСКИЙ ОРДЕР № 19 29.01.2021\nДата\nСумма Тридцать рублей 00 копеек Вид оп. 17\nпрописью\n|\nНРВ.Глобал Бизнес ГмбхХ, Санкт- 40807810000002500221 30-00\nПетербургское Представительство компании\nКомиссии за исполнение платежей юр.лиц в | 70601810400002740200\nрублях\nНазначение платежа\n{МО80050}Комиссия за исполнение п/п № 19 от 29.01.21 Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nИсполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\nРоссии по ЦФО\nНаз. пл.: ПОДПИСИ\n';

const testText2 =
  '0401060\n29.01.2021 29.01.2021\nПоступ. в банк плат. Списано со сч. плат.\n29.01.2021\nПЛАТЕЖНОЕ ПОРУЧЕНИЕ № 21 поллллллллллНОООЛЛ пплоОООООАОООАО\nДата Вид платежа\nСумма Триста пятьдесят рублей 00 копеек\nпрописью\nИНН 9909077381 КПП — 783551001 Сумма | 350-00\nНРВ.Глобал Бизнес ГмбхХ, Санкт-Петербургское Представительство\nкомпании "НРВ.Глобал Бизнес ГмбХ" (Германия)\nСч. М 40807810000002500221\nПлательщик\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)" г. Москва 044525105\nСч. М 30101810300000000105\nБанк плательщика\nПЕТЕРБУ… ЮНИКРЕДИТ БАНКА г. Санкт- БИК 044030858\nПетербург\nСч. М 30101810800000000858\nБанк получателя\nИНН 7812014560 КПП — 780103001 Сч. М 40702810500020007683\nСеверо-Западный филиал ПАО "МегаФон"\nя\n5\n{МО20100} Авансовый платеж за услуги связи по лицевому счету 120039839077 (за номер 9216573179) Сумма 350-00В т.ч. НДС (20%)\n58-33\nНазначение платежа\nПодписи Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nМ.П. полллоолоООО Исполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\n— России по ЦФО\n';
/// END Globals

//run test
//testExctractWithoutTesseract();

//extractTextFromImages();

module.exports = async function extractTextFromImages() {
  cleanOutputJson();
  if (fs.existsSync(PATH_TO_IMAGES_FOLDER)) {
    let files = fs.readdirSync(PATH_TO_IMAGES_FOLDER);
    for (const file of files) {
      await extractTextFromImage(file);
    }
  }
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

  let newInvoiceData = getInvoiceData(text, id);
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

// Gets needed substrings from text
function getInvoiceData(text, id) {
  const invoiceDate = getInvoiceDateFromString(text);
  const invoiceSum = getInvoiceSumFromString(text);
  return {
    id,
    invoiceDate,
    invoiceSum,
    text,
  };
}

function getInvoiceDateFromString(text) {
  if (getDocType(text) == invoiceTypesEnum["БАНКОВСКИЙ ОРДЕР"]) {
    if (text.indexOf("Дата") > -1) {
      return text.substr(text.indexOf("Дата") - 11, 10);
    }
  } else if (getDocType(text) == invoiceTypesEnum["ПЛАТЕЖНОЕ ПОРУЧЕНИЕ"]) {
    if (text.indexOf("Поступ. в банк") > -1) {
      return text.substr(text.indexOf("Поступ. в банк") - 11, 10);
    }
  } else return null;
}

function getInvoiceSumFromString(text) {
  if (
    // sum is placed between two following substrings
    text.indexOf("40807810000002500221") > -1 &&
    text.indexOf("Петербургское Представительство") > -1
  ) {
    if (getDocType(text) == invoiceTypesEnum["БАНКОВСКИЙ ОРДЕР"]) {
      return text
        .substring(
          text.indexOf("40807810000002500221") + "40807810000002500221".length, // look after this substring
          text.indexOf("Петербургское Представительство") // and before this one
        )
        .trim();
    } else if (getDocType(text) == invoiceTypesEnum["ПЛАТЕЖНОЕ ПОРУЧЕНИЕ"]) {
      return text
        .substring(
          text.indexOf("Сумма |") + "Сумма |".length, // look after this substring
          text.indexOf("НРВ.Глобал Бизнес") // and before this one
        )
        .trim();
    }
  } else return null;
}

function getDocType(text) {
  if (text.indexOf("БАНКОВСКИЙ ОРДЕР") > -1)
    return invoiceTypesEnum["БАНКОВСКИЙ ОРДЕР"];
  else if (text.indexOf("ПЛАТЕЖНОЕ ПОРУЧЕНИЕ") > -1)
    return invoiceTypesEnum["ПЛАТЕЖНОЕ ПОРУЧЕНИЕ"];
  else {
    return null;
  }
}

function testExctractWithoutTesseract() {
  for (let i = 0; i < 1; i++) {
    updateJsonData(testText2, 11);
  }
}

//module.exports = getInvoiceData; // for testing
