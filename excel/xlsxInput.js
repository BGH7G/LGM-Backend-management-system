const XLSX = require('xlsx');

function readExcelFiles(filepath) {
    try {
        const workbook = XLSX.readFile(filepath);

        const firstSheetName = workbook.SheetNames[0];
        console.log(firstSheetName); // undefined

        const worksheet = workbook.Sheets[firstSheetName];

        return XLSX.utils.sheet_to_json(worksheet);
    } catch (err) {
        console.log('没有获取到数据', err)
    }
}

const data = readExcelFiles('./Rumen.xlsx')

console.log(data[0])