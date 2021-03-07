const convertPdfToImage = require("./convertPdfToImage");
const extractTextFromImages = require("./extractTextFromImages");
const extractExcel2Json = require("./extractExcel2Json");
const sortJsonData = require("./sortJsonData");
const writeJsonToPdf = require("./writeJsonToPdf");

// input: pdf file and excel file
// output: new pdf file with sorted pages with added text taken from excel file
// step 1: sort pdf pages in excel order (read text from pdf
//using OCR by converting to JPG and compare data (date, price) to excel data)
// step 2: write to pdf

const excelPath = null; // todo get from user
const pdfPath = null; // todo get from user

//writeExcelToPdf(excelPath, pdfPath).catch((err) => console.log(err));

async function writeExcelTextToPdf() {
  const resultConvert = await convertPdfToImage("report12.pdf");
  const resultOCR = await extractTextFromImages();
  const resultExcel = await extractExcel2Json();
  const resultSort = await sortJsonData();
  const result = await writeJsonToPdf();
  return result;
}

writeExcelTextToPdf();
