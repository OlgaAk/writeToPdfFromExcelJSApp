const convertPdfToImage = require("./convertPdfToImage");
const extractTextFromImages = require("./extractTextFromImages");
const extractExcel2Json = require("./extractExcel2Json");
const sortJsonData = require("./sortJsonData");
const writeJsonToPdf = require("./writeJsonToPdf");
const addPdfPages = require("./addPdfPages");

// input: pdf file and excel file
// output: new pdf file with sorted pages with added text taken from excel file
// step 1: sort pdf pages in excel order (read text from pdf
//using OCR by converting to JPG and compare data (date, price) to excel data)
// step 2: write to pdf

const pdfPath = "feb.pdf"; // todo get from user
const excelPath = "Abrechnungen Februar 2021.xlsx"; //get path from user
const RESULT_PDF_PATH = "./Belege.pdf";
//writeExcelToPdf(excelPath, pdfPath).catch((err) => console.log(err));

const newPages = [
  { path: "./beleg/buch.pdf", excelId: 0 },
  { path: "./beleg/office.pdf", excelId: 1 },
  { path: "./beleg/megafon.pdf", excelId: 25 },
  { path: "./beleg/fly.pdf", excelId: 13 },
  { path: "./beleg/handy1.pdf", excelId: 39 },
  { path: "./beleg/handy2.pdf", excelId: 40 },
  { path: "./beleg/handy3.pdf", excelId: 41 },
  { path: "./beleg/park.pdf", excelId: 12 },
  { path: "./beleg/electr.pdf", excelId: 11 },
  { path: "./beleg/express.pdf", excelId: 31 },
  { path: "./beleg/trans1.pdf", excelId: 27 },
  { path: "./beleg/trans2.pdf", excelId: 29 },
  { path: "./beleg/uborka.pdf", excelId: 8 },
];

async function writeExcelTextToPdf() {
  // const resultConvert = await convertPdfToImage(pdfPath);
  //const resultOCR = await extractTextFromImages();
  // const resultExcel = await extractExcel2Json(excelPath);
  //const resultSort = await sortJsonData();
  //const result = await writeJsonToPdf(pdfPath);
  addPdfPages(RESULT_PDF_PATH, newPages);
}

writeExcelTextToPdf();
