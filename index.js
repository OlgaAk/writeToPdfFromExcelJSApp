const convertPdfToImage = require("./convertPdfToImage");
const extractTextFromImages = require("./extractTextFromImages");
const extractDataFromExcel2Json = require("./extractExcel2Json");
const orderPdfPages = require("./orderPdfPages");
const writeExcelToPdf = require("./writeExcelToPdf");

// input: pdf file and excel file
// output: new pdf file with sorted pages with added text taken from excel file
// step 1: sort pdf pages in excel order (read text from pdf
//using OCR by converting to JPG and compare data (date, price) to excel data)
// step 2: write to pdf

const excelPath = null; // todo get from user
const pdfPath = null; // todo get from user

//writeExcelToPdf(excelPath, pdfPath).catch((err) => console.log(err));

//convertPdfToImage("report12.pdf");

extractTextFromImages();
