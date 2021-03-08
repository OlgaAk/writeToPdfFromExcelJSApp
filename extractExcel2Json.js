const fs = require("fs");
const ExcelJS = require("exceljs");
const PATH_TO_OUTPUT_JSON = "excel_data.json";

//let SOURCE_EXCEL_PATH = "00.xlsx"; //get path from user
const COLUMN_NAME = "D"; // make user define
const COLUMN_DATE = "A"; // make user define
const COLUMN_SUM = "K";
const COLUMN_SUM_INCOME = "F";
const COLUMN_SUM_TOCARD = "J";
let START_ROW = 10; //make user define

let credicard = false;
if (credicard) {
  SOURCE_EXCEL_PATH = "111.xlsx"; //get path from user
  START_ROW = 7;
}

//writeExcelToJson();
module.exports = async function writeExcelToJson(excelPath) {
  // excelPath, pdfPath use instead of constants
  const data = await readExcel(excelPath);
  if (data) {
    writeDataToJson(data);
    return true; //tofix
  } else {
    console.log("no data from excel");
    return false;
  }
};

function writeDataToJson(excelData) {
  const json = JSON.stringify(excelData);
  fs.writeFileSync(PATH_TO_OUTPUT_JSON, json, "utf-8");
}

async function readExcel(excelPath) {
  const sheet = await loadExcelSheet(excelPath);
  try {
    const cellValues = getCellValues(
      sheet,
      START_ROW,
      COLUMN_NAME,
      COLUMN_DATE,
      COLUMN_SUM,
      COLUMN_SUM_INCOME,
      COLUMN_SUM_TOCARD
    );
    return cellValues;
  } catch (err) {}
}

async function loadExcelSheet(excelPath) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(excelPath);
    return (sheet = workbook.worksheets[0]); // make user define
  } catch (err) {
    if (err.message.includes("File not found")) {
      console.log("Error opening EXCEL file. Please try another file.");
    }
  }
}

function getCellValues(
  sheet,
  startRow,
  columnName,
  columnDate,
  columnSum,
  columnSumIncome,
  columnSumToCard
) {
  let excelValues = [];
  let id = 0;
  while (true) {
    let cellName = sheet.getCell(`${columnName}${startRow}`).value;
    let cellDate = sheet.getCell(`${columnDate}${startRow}`).value;
    let cellSum = sheet.getCell(`${columnSum}${startRow}`).value;
    let cellSumIncome = sheet.getCell(`${columnSumIncome}${startRow}`).value;
    let cellSumToCard = sheet.getCell(`${columnSumToCard}${startRow}`).value;
    let excelRowData = {
      id,
      cellName,
      cellDate,
      cellSum,
      cellSumIncome,
      cellSumToCard,
    };
    if (cellName == "" || cellName == "Total:" || cellName == null) break;
    excelValues.push(excelRowData);
    startRow++;
    id++;
  }
  return excelValues;
}
