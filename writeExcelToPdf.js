const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const ExcelJS = require("exceljs");

let SOURCE_PDF_PATH = "./00.pdf"; //get path from user
let OUTPUT_PDF_PATH = "./Belege_Januar_2021.pdf"; //get path from user
let SOURCE_EXCEL_PATH = "00.xlsx"; //get path from user
const TEXT_COLOR = rgb(0.41, 0.48, 0.74); //make user define
const TEXT_SIZE = 15; //make user define
const COLUMN = "D"; // make user define
let START_ROW = 10; //make user define
let SPACE_FROM_TOP = 25;

let credicard = true;
if (credicard) {
  OUTPUT_PDF_PATH = "Belege_Kreditkarte_Januar_2021.pdf";
  SOURCE_PDF_PATH = "./111.pdf"; //get path from user
  SOURCE_EXCEL_PATH = "111.xlsx"; //get path from user
  START_ROW = 7;
  SPACE_FROM_TOP = 65;
}

module.exports = async function writeExcelToPdf(excelPath, pdfPath) {
  // excelPath, pdfPath use instead of constants
  readExcel()
    .then((data) => {
      if (data) {
        writeToPdf(data);
      } else {
        console.log("no data from excel");
      }
    })
    .catch((err) => console.log(err));
};

async function writeToPdf(excelData) {
  // Create a new document and add a new page
  try {
    const [doc, font, pages] = await setUpPDF();
    checkInputData(excelData, pages);
    pages.forEach((page, index) => {
      // checking to avoid out of index exception
      if (excelData.length > index) {
        drawTextOnPdf(page, index, excelData, font, TEXT_SIZE, TEXT_COLOR);
      }
    });
    fs.writeFileSync(OUTPUT_PDF_PATH, await doc.save());
  } catch (err) {
    if (err.code == "ENOENT") {
      console.log("Error opening PDF file. Please try another file.");
    }
  }
}

async function readExcel() {
  const sheet = await loadExcelSheet();
  try {
    const cellValues = getCellValues(sheet, START_ROW, COLUMN);
    return cellValues;
  } catch (err) {}
}

function drawTextOnPdf(page, index, data, font, size, color) {
  console.log(data[index].length > 55, data[index].length, index == 39, index);
  let mySize = size;
  if (data[index].length > 70) {
    mySize = size - 4;
    console.log(mySize, index);
  }
  let myY = SPACE_FROM_TOP;
  if (index == 38) {
    myY = 15;
    console.log(myY);
  }
  page.drawText(`B#${index + 1} ${data[index]}`, {
    x: 15,
    y: page.getHeight() - myY,
    size: mySize,
    font: font,
    color: color,
  });
}

function checkInputData(excelData, pages) {
  if (excelData.length > pages.length) {
    console.log(
      `You have more data in excel than pdf pages (${
        excelData.length - pages.length
      } cell(s)). This information will be missing.`
    );
  } else if (excelData.length < pages.length) {
    console.log(`Excell data provided is not sufficient for all PDF pages. 
  ${pages.length - excelData.length} page(s) remaind untouched.`);
  }
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

function getCellValues(sheet, startRow, column) {
  let excelValues = [];
  console.log("getCellValues");
  while (true) {
    let cell = sheet.getCell(`${column}${startRow}`);
    console.log(cell.value);
    if (cell.value == "" || cell.value == "Total:" || cell.value == null) break; // make user define
    excelValues.push(cell.value);
    startRow++;
  }
  return excelValues;
}

async function setUpPDF() {
  const doc = await PDFDocument.load(fs.readFileSync(SOURCE_PDF_PATH));
  const font = await doc.embedFont(StandardFonts.CourierOblique);
  const pages = await doc.getPages();
  return [doc, font, pages];
}
