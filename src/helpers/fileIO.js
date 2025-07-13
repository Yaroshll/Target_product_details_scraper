import fs from 'fs'; 
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const fileName = `Target_products_${timestamp}`;
  const outputDir = './output';
  
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // Create main product row
  const productData = [productRow];

  // Add image rows with same handle
  extraImages.forEach(image => {
    productData.push({
      Handle: productRow.Handle,
      "Image Src": image["Image Src"],
      // Empty other fields for image rows
      Title: '',
      "Body (HTML)": '',
      // ... other empty fields ...
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