const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");

//let SOURCE_PDF_PATH = "./report.pdf"; //get path from user
let OUTPUT_PDF_PATH = "./Belege.pdf"; //get path from user
let SOURCE_JSON_PATH = "result_data.json"; //get path from user
const TEXT_COLOR = rgb(0.41, 0.48, 0.74); //make user define
const TEXT_SIZE = 15; //make user define
let SPACE_FROM_TOP = 25;

//writeJsonToPdf();

async function writeJsonToPdf(sourcePdfPath) {
  const data = await readJson();
  if (data) {
    writeToPdf(data, sourcePdfPath);
    return true; //tofix
  } else {
    console.log("no data from excel");
    return false;
  }
}

async function writeToPdf(jsonData, sourcePdfPath) {
  try {
    const [doc, font, pages] = await setUpPDF(jsonData, sourcePdfPath);
    await writeTextToPDFPages(pages, font, jsonData);

    fs.writeFileSync(OUTPUT_PDF_PATH, await doc.save());
  } catch (err) {
    console.log(err);
    if (err.code == "ENOENT") {
      console.log("Error opening PDF file. Please try another file.");
    }
  }
}

function writeTextToPDFPages(pages, font, jsonData) {
  let i = -1;
  pages.forEach(async (page) => {
    i++;
    await drawTextOnPdf(page, jsonData[i], font, TEXT_SIZE, TEXT_COLOR);
  });
}

async function readJson() {
  if (fs.existsSync(SOURCE_JSON_PATH)) {
    const data = fs.readFileSync(SOURCE_JSON_PATH);
    return JSON.parse(data);
  }
}

async function drawTextOnPdf(page, jsonItem, font, size, color) {
  let mySize = size;
  if (jsonItem.excelName.length > 70) {
    mySize = size - 4;
  }
  let invoiceNumber = jsonItem.excelId + 1;
  page.drawText(`B#${invoiceNumber} ${jsonItem.excelName}`, {
    x: 15,
    y: page.getHeight() - SPACE_FROM_TOP,
    size: mySize,
    font: font,
    color: color,
  });
}

async function setUpPDF(jsonData, sourcePdfPath) {
  const doc = await PDFDocument.load(fs.readFileSync(sourcePdfPath));

  let pdfPageNumbers = jsonData.map((item) => {
    return item.id;
  });
  const newPdfDoc = await PDFDocument.create();
  const pages = await newPdfDoc.copyPages(doc, pdfPageNumbers);
  pages.forEach((page) => {
    newPdfDoc.addPage(page);
  });
  const font = await newPdfDoc.embedFont(StandardFonts.CourierOblique);

  return [newPdfDoc, font, pages]; //if pages has 1 item it is not array and not itirable tofix
}

module.exports = writeJsonToPdf;
