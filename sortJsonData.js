const fs = require("fs");
const PATH_TO_PDF_JSON = "invoce_data.json";
const PATH_TO_EXCEL_JSON = "excel_data.json";
const PATH_TO_RESULT_JSON = "result_data.json";

sortJsonData();

async function sortJsonData() {
  const excelData = await getExcelDataFromJson();
  const pdfData = await gePdfDataFromJson();
  let sortedPdfData = [];
  for (let i = 0; i < excelData.length; i++) {
    for (let j = 0; j < pdfData.length; j++) {
      let isSameInvoice = checkIfSameInvoice(excelData[i], pdfData[j]);
      if (isSameInvoice) {
        let newPdfData = pdfData[j];
        newPdfData.excelId = excelData[i].id;
        newPdfData.excelName = excelData[i].cellName;
        sortedPdfData.push(newPdfData);
        pdfData.splice(j, 1);
        break;
      }
    }
  }
  const oderedPdfData = sortedPdfData.sort((a, b) => {
    return a.excelId - b.excelId;
  });
  write2Json(oderedPdfData);
}

function checkIfSameInvoice(excelItem, pdfItem) {
  let dateExcel = excelItem.cellDate;
  let datePdf = pdfItem.invoiceDate;
  let sumExcel = getSum(excelItem);
  let sumPdf = pdfItem.invoiceSum;
  let isSameDate = checkIfSameDate(dateExcel, datePdf);
  let isSameSum = checkIfSameSum(sumExcel, sumPdf);
  if (isSameDate && isSameSum) {
    return true;
  } else {
    return false;
  }
}

function checkIfSameDate(dateExcel, datePdf) {
  //Formats: ("29.01.2021") ("2021-01-29T00:00:00.000Z")
  const datePdfToArray = datePdf.split(".");
  const datePdfToDateFormat = `${datePdfToArray[2]}-${datePdfToArray[1]}-${datePdfToArray[0]}`; //"2021-01-29"
  const date1 = new Date(datePdfToDateFormat);
  const date2 = new Date(dateExcel);
  console.log(date1, date2, date1.getTime() == date2.getTime());
  return date1.getTime() == date2.getTime();
}

function checkIfSameSum(sumExcel, sumPdf) {
  //Formats: "30-00" -30  -840.52
  console.log(sumExcel, sumPdf);
  const sumPdfInt = sumPdf.split("-").join("."); //"30-00" -> "30.00"
  const sum1 = parseFloat(sumPdfInt).toFixed(2); // "30.20" -> 30
  const sum2 = Math.abs(sumExcel).toFixed(2).toString(); // -840.52 -> 840.52
  console.log(sum1, sum2, sum1 == sum2);
  return sum1 == sum2;
}

function getSum(excelItem) {
  if (excelItem.cellSum != null) return excelItem.cellSum;
  if (excelItem.cellSumToCard != null) return excelItem.cellSumToCard;
  if (excelItem.cellSumIncome != null) return excelItem.cellSumIncome;
}

function getExcelDataFromJson() {
  if (fs.existsSync(PATH_TO_EXCEL_JSON)) {
    const data = fs.readFileSync(PATH_TO_EXCEL_JSON);
    return JSON.parse(data);
  }
}

function gePdfDataFromJson() {
  if (fs.existsSync(PATH_TO_PDF_JSON)) {
    const data = fs.readFileSync(PATH_TO_PDF_JSON);
    return JSON.parse(data).invoiceData.reverse();
  }
}

function write2Json(data) {
  const json = JSON.stringify(data);
  fs.writeFileSync(PATH_TO_RESULT_JSON, json, "utf-8");
}

module.exports = sortJsonData;
