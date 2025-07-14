import fs from 'fs'; 
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages = [], variantRows = []) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const fileName = `Target_products_${timestamp}`;
  const outputDir = './output';
  
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Create main product data array starting with the product row
  const productData = [productRow];

  // Add extra images
  extraImages.forEach(image => {
    productData.push({
      Handle: productRow.Handle,
      "Image Src": image["Image Src"],
      // Empty other fields for image rows
      Title: '',
      "Body (HTML)": '',
      Vendor: '',
      Type: '',
      Tags: ''
    });
  });

  // Add variant rows
  variantRows.forEach(variant => {
    productData.push({
      Handle: variant.Handle,
      "Option1 Name": productRow["Option1 Name"] || '',
      "Option1 Value": variant["Option1 Value"],
      "Option2 Name": productRow["Option2 Name"] || '',
      "Option2 Value": variant["Option2 Value"],
      "Variant SKU": variant["Variant SKU"],
      "Variant Price": variant["Variant Price"],
      "Variant Compare At Price": variant["Variant Compare At Price"],
      "Image Src": variant["Image Src"],
      // Include all DEFAULT_VALUES
      Vendor: productRow.Vendor,
      Type: productRow.Type,
      Status: productRow.Status,
      Published: productRow.Published,
      "Fulfillment Service": productRow["Fulfillment Service"],
      "Inventory Policy": productRow["Inventory Policy"],
      "Inventory Tracker": productRow["Inventory Tracker"],
      "Inventory Quantity": productRow["Inventory Quantity"],
      "Variant Weight Unit": productRow["Variant Weight Unit"],
      Taxable: productRow.Taxable,
      "Requires Shipping": productRow["Requires Shipping"],
      "Cost per item": productRow["Cost per item"],
      "Original Price": productRow["Original Price"]
    });
  });

  // Create worksheet and workbook
  const ws = xlsx.utils.json_to_sheet(productData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Products');

  // Save files
  const csvPath = path.join(outputDir, `${fileName}.csv`);
  const excelPath = path.join(outputDir, `${fileName}.xlsx`);

  xlsx.writeFile(wb, csvPath, { bookType: 'csv' });
  xlsx.writeFile(wb, excelPath);

  console.log(`📁 Files saved: ${csvPath}, ${excelPath}`);
}