// helpers/fileIO.js
import fs from 'fs'; 
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages, variantRows = []) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const fileName = `Target_products_${timestamp}`;
  const outputDir = './output';
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const productData = [productRow, ...variantRows];

  extraImages.forEach(image => {
    productData.push({
      Handle: image.Handle,
      "Image Src": image["Image Src"],
      "Option1 Name": image["Option1 Name"] || "",
      "Option1 Value": image["Option1 Value"] || "",
      "Option2 Name": image["Option2 Name"] || "",
      "Option2 Value": image["Option2 Value"] || "",
      Title: '', "Body (HTML)": ''
    });
  });


  const ws = xlsx.utils.json_to_sheet(productData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Products');

  const csvPath = path.join(outputDir, `${fileName}.csv`);
  const excelPath = path.join(outputDir, `${fileName}.xlsx`);

  xlsx.writeFile(wb, csvPath, { bookType: 'csv' });
  xlsx.writeFile(wb, excelPath);
}