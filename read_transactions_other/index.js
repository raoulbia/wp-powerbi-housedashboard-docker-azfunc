// Import necessary modules
const ExcelJS = require('exceljs');
const { BlobServiceClient } = require('@azure/storage-blob');

// Define the Azure Function
module.exports = async function (context, req) {
  try {
    // Define the Azure Data Lake Storage (ADLS) details
    const connectionString = process.env["AzureWebJobsStorage"];
    const containerName = 'housedashboardcontainer';
    const directoryName = 'data';
    const fileName = 'other_expenses_master.xlsx';

    // Azure Storage operations
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(`${directoryName}/${fileName}`);
    const downloadResponse = await blobClient.download();

    // Data processing operations
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(downloadResponse.readableStreamBody);
    const dataStartRow = 2;

    // Get the first worksheet from the workbook
    const worksheet = workbook.worksheets[0];

    // Extract data from the worksheet and convert each cell to a string
    const data = worksheet.getSheetValues().map(row => row.map(cell => cell ? cell.toString().trim() : null));

    // Get the column headers from the first row of the Excel file
    const headerRow = data[dataStartRow - 1];
    const actualColumns = headerRow.map(column => column.trim());

    // Validate the column structure
    // const expectedColumns = ['Column1', 'Column2', 'Column3'];
    // if (actualColumns.length !== expectedColumns.length || !expectedColumns.every(column => actualColumns.includes(column))) {
    //   // Column structure mismatch
    //   throw new Error('Column structure mismatch between the file and the Power BI table');
    // }

    // Convert the data to JSON and format it as required
    const jsonData = data.slice(dataStartRow).map(row => {
      return {
        payment_date: row[1] || null,
        payer: row[2] || null,
        payee: row[3] || null,
        amount: row[4] || null,
        description: row[5] || null,
        category: row[6] || null
      };
    });

    // Set the response body to the JSON data
    context.res = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData, null, 2)
    };
  } catch (error) {
    // Log the error and set the response to the error message
    context.log(`Error: ${error.message}`);
    context.res = {
      status: 500,
      body: `Error: ${error.message}`
    };
  }
};