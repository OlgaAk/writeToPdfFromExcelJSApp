const fs = require("fs");
const ExcelJS = require("exceljs");
const PATH_TO_OUTPUT_JSON = "excel_data.json";

let SOURCE_EXCEL_PATH = "00.xlsx"; //get path from user
const COLUMN_NAME = "D"; // make user define
const COLUMN_DATE = "A"; // make user define
const COLUMN_SUM = "K";
const COLUMN_SUM_INCOME = "F";
const COLUMN_SUM_TOCARD = "G";
let START_ROW = 10; //make user define

let credicard = false;
if (credicard) {
  SOURCE_EXCEL_PATH = "111.xlsx"; //get path from user
  START_ROW = 7;
}

writeExcelToJson();

function writeExcelToJson() {
  // excelPath, pdfPath use instead of constants
  readExcel()
    .then((data) => {
      if (data) {
        writeDataToJson(data);
      } else {
        console.log("no data from excel");
      }
    })
    .catch((err) => console.log(err));
}

function writeDataToJson(excelData) {
  const json = JSON.stringify(excelData);
  fs.writeFileSync(PATH_TO_OUTPUT_JSON, json, "utf-8");
}

async function readExcel() {
  const sheet = await loadExcelSheet();
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

async function loadExcelSheet() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(SOURCE_EXCEL_PATH);
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
