const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");

const ExcelJS = require("exceljs");

const SOURCE_PDF_PATH = "./1.pdf"; //get path from user
const OUTPUT_PDF_PATH = "./test.pdf"; //get path from user
const SOURCE_EXCEL_PATH = "2.xlsx"; //get path from user
const TEXT_COLOR = rgb(0.41, 0.48, 0.74); //make user define
const TEXT_SIZE = 15; //make user define
const COLUMN = "D"; // make user define
const START_ROW = 10; //make user define

addExcelDataToPdf().catch((err) => console.log(err));

async function writeToPdf(data) {
  // Create a new document and add a new page

  const doc = await PDFDocument.load(fs.readFileSync(SOURCE_PDF_PATH));
  const font = await doc.embedFont(StandardFonts.CourierOblique);
  const pages = await doc.getPages();

  pages.forEach((page, index) => {
    if (data.length > index) drawTextOnPdf(page, index, data, font);
  });

  // Write the PDF to a file
  fs.writeFileSync(OUTPUT_PDF_PATH, await doc.save());
}

async function readExcel() {
  let excelValues = [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_EXCEL_PATH);
  const sheet = workbook.worksheets[0]; // make user define
  let start_row = START_ROW;
  while (true) {
    let cell = sheet.getCell(`${COLUMN}${start_row}`);
    console.log(cell.value);
    if (cell.value == "" || cell.value == "Total:") break; // make user define
    excelValues.push(cell.value);
    start_row++;
  }
  return excelValues;
}

async function addExcelDataToPdf() {
  readExcel()
    .then((data) => {
      writeToPdf(data);
    })
    .catch((err) => console.log(err));
}

function drawTextOnPdf(page, index, data, font) {
  page.drawText(`B#${index + 1} ${data[index]}`, {
    x: 15,
    y: page.getHeight() - 25,
    size: TEXT_SIZE,
    font: font,
    color: TEXT_COLOR,
  });
}
