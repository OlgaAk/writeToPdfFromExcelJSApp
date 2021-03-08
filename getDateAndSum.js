const fs = require("fs");
const PATH_TO_JSON = "invoce_data.json";

const invoiceTypesEnum = { "БАНКОВСКИЙ ОРДЕР": 1, "ПЛАТЕЖНОЕ ПОРУЧЕНИЕ": 2 }; // todo use typescript

// Mock Data to substitute Tesseract job
const testText =
  '0401067\nБАНКОВСКИЙ ОРДЕР № 19 29.01.2021\nДата\nСумма Тридцать рублей 00 копеек Вид оп. 17\nпрописью\n|\nНРВ.Глобал Бизнес ГмбхХ, Санкт- 40807810000002500221 30-00\nПетербургское Представительство компании\nКомиссии за исполнение платежей юр.лиц в | 70601810400002740200\nрублях\nНазначение платежа\n{МО80050}Комиссия за исполнение п/п № 19 от 29.01.21 Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nИсполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\nРоссии по ЦФО\nНаз. пл.: ПОДПИСИ\n';

const testText2 =
  '0401060\n29.01.2021 29.01.2021\nПоступ. в банк плат. Списано со сч. плат.\n29.01.2021\nПЛАТЕЖНОЕ ПОРУЧЕНИЕ № 21 поллллллллллНОООЛЛ пплоОООООАОООАО\nДата Вид платежа\nСумма Триста пятьдесят рублей 00 копеек\nпрописью\nИНН 9909077381 КПП — 783551001 Сумма | 350-00\nНРВ.Глобал Бизнес ГмбхХ, Санкт-Петербургское Представительство\nкомпании "НРВ.Глобал Бизнес ГмбХ" (Германия)\nСч. М 40807810000002500221\nПлательщик\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)" г. Москва 044525105\nСч. М 30101810300000000105\nБанк плательщика\nПЕТЕРБУ… ЮНИКРЕДИТ БАНКА г. Санкт- БИК 044030858\nПетербург\nСч. М 30101810800000000858\nБанк получателя\nИНН 7812014560 КПП — 780103001 Сч. М 40702810500020007683\nСеверо-Западный филиал ПАО "МегаФон"\nя\n5\n{МО20100} Авансовый платеж за услуги связи по лицевому счету 120039839077 (за номер 9216573179) Сумма 350-00В т.ч. НДС (20%)\n58-33\nНазначение платежа\nПодписи Отметки банка\nАО "КОММЕРЦБАНК (ЕВРАЗИЯ)"\nМ.П. полллоолоООО Исполнено:29.01.2021\nБИК 044525105,\nк/с 30101810300000000105 в ГУ Банка\n— России по ЦФО\n';
/// END Globals

getDateAndSum();

async function getDateAndSum() {
  const data = await readJson();
  if (data) {
    const newInvoiceData = await extractDatesAndSums(data.invoiceData);
    writeDataToJson(newInvoiceData);
    return true; //tofix
  } else {
    console.log("no data from excel");
    return false;
  }
}

async function extractDatesAndSums(data) {
  let newJsonData = [];
  for (let i = 0; i < data.length; i++) {
    const extendedItem = await extractDateAndSum(data[i].text, data[i].id);
    newJsonData.push(extendedItem);
  }
  return newJsonData;
}

async function readJson() {
  if (fs.existsSync(PATH_TO_JSON)) {
    const data = fs.readFileSync(PATH_TO_JSON);
    return JSON.parse(data);
  }
}

async function extractDateAndSum(text, id) {
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
    text.indexOf("7810000002500221") > -1 &&
    text.indexOf("Представительство") > -1
  ) {
    if (getDocType(text) == invoiceTypesEnum["БАНКОВСКИЙ ОРДЕР"]) {
      const regexp = /\d+-\d{2}/g;
      return text.match(regexp)[0];
    } else if (getDocType(text) == invoiceTypesEnum["ПЛАТЕЖНОЕ ПОРУЧЕНИЕ"]) {
      return text
        .substring(
          text.indexOf("Сумма |") + "Сумма |".length, // look after this substring
          text.indexOf("НРВ") // and before this one
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

function writeDataToJson(newInvoiceData) {
  let jsonData = {};

  jsonData.invoiceData = newInvoiceData;

  const json = JSON.stringify(jsonData);
  fs.writeFileSync(PATH_TO_JSON, json, "utf-8");
}

function testExctractWithoutTesseract() {
  for (let i = 0; i < 1; i++) {
    updateJsonData(testText2, 11);
  }
}

//module.exports = getInvoiceData; // for testing
