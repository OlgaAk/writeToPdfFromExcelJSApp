const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");

//let SOURCE_PDF_PATH = "./report.pdf"; //get path from user
let OUTPUT_PDF_PATH = "./BelegeAdded.pdf"; //get path from user
let SOURCE_JSON_PATH = "result_data.json"; //get path from user
const TEXT_COLOR = rgb(0.41, 0.48, 0.74); //make user define
const TEXT_SIZE = 15; //make user define
let SPACE_FROM_TOP = 25;

async function addPdfPages(sourcePdfPath, newPages) {
  const data = await readJson();
  if (data) {
    const doc = await PDFDocument.load(fs.readFileSync(sourcePdfPath));

    await addPages(data, doc, newPages);
    fs.writeFileSync(OUTPUT_PDF_PATH, await doc.save());
    return true; //tofix
  } else {
    console.log("no data from excel");
    return false;
  }
}

async function readJson() {
  if (fs.existsSync(SOURCE_JSON_PATH)) {
    const data = fs.readFileSync(SOURCE_JSON_PATH);
    return JSON.parse(data);
  }
}

function drawTextOnPdf(page, jsonItem, font, size, color) {
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

async function addPages(jsonData, doc, newPages) {
  for (let i = 0; i < newPages.length; i++) {
    await addPage(jsonData, doc, newPages[i]);
  }
}

async function addPage(jsonData, doc, invoice) {
  const invoiceItem = jsonData.find((item) => {
    return item.excelId == invoice.excelId.toString();
  });
  try {
    const additionalDoc = await PDFDocument.load(fs.readFileSync(invoice.path));
    const p = additionalDoc.getPage(0);
    const font = await additionalDoc.embedFont(StandardFonts.CourierOblique);
    drawTextOnPdf(p, invoiceItem, font, TEXT_SIZE, TEXT_COLOR);
    const page = await doc.copyPages(additionalDoc, [0]); // one page docs accepted
    const newPage = page[0];
    doc.removePage(invoice.excelId);
    doc.insertPage(invoice.excelId, newPage);
  } catch (e) {
    console.log(e);
  }
}

module.exports = addPdfPages;
