const axios = require('axios');
const ExcelJS = require('exceljs');
const moment = require('moment');
const { DefaultAzureCredential } = require('@azure/identity');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
  try {
    // Define the ADLS details
    const connectionString = process.env["AzureWebJobsStorage"];
    const containerName = 'housedashboardcontainer';
    const directoryName = 'data';
    const fileName = 'other_expenses_master.xlsx';

    // Read the Excel file from ADLS
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(`${directoryName}/${fileName}`);
    const downloadResponse = await blobClient.download();

    // Load the workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(downloadResponse.readableStreamBody);

    // Assuming the data starts from the second row (index 1) of the Excel file
    const dataStartRow = 2;

    // Assuming the expected column names in the Power BI table
    const expectedColumns = ['Column1', 'Column2', 'Column3'];

    // Get the first worksheet from the workbook
    const worksheet = workbook.worksheets[0];

    // Get the data from the worksheet
    const data = worksheet.getSheetValues().map(row => row.map(cell => cell ? cell.toString().trim() : null));

    // Assuming the column headers are in the first row of the Excel file
    const headerRow = data[dataStartRow - 1];
    const actualColumns = headerRow.map(column => column.trim());

    // Validate the column structure
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
    context.log(`Error: ${error.message}`);
    context.res = {
      status: 500,
      body: `Error: ${error.message}`
    };
  }
};
