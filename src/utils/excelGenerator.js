import ExcelJS from 'exceljs';

/**
 * Генерує Excel акт фіксації показників та розрахунок споживання
 */
export const generateConsumptionAct = async (readings, resourceType, options = {}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Акт');

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  let currentRow = 1;

  worksheet.getRow(currentRow).values = [
    `Акт фіксації показників та розрахунок споживання ${getResourceGenitive(resourceType)}`,
  ];
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 25;
  currentRow++;

  worksheet.getRow(currentRow).values = [options.tenantCompany || 'ТОВ "ГалФрост"'];
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  const companyCell = worksheet.getCell(currentRow, 1);
  companyCell.font = { size: 12, bold: true };
  companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  currentRow += 2;

  const introText = `${options.organization || 'ТОВ «Про Тек Вікна Україна»'}, в особі ${
    options.executorName || 'головного енергетика'
  }, та\n${options.tenantCompany || 'ТОВ "ГалФрост"'}, в особі ${
    options.tenantRepresentative || 'керуючого'
  }, склали цей акт про наступне:\n1. Сторони цього акту зафіксували показники наступних приладів обліку, які знаходяться в приміщеннях за адресою:\n${
    options.address || 'Львівська обл., с. Зимна Вода, вул. Яворівська, 30'
  }:`;

  worksheet.getRow(currentRow).values = [introText];
  worksheet.mergeCells(currentRow, 1, currentRow + 2, 12);
  const introCell = worksheet.getCell(currentRow, 1);
  introCell.font = { size: 10 };
  introCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  worksheet.getRow(currentRow).height = 60;
  currentRow += 4;

  const [startDate, endDate] = getPeriodDates(options.period);
  worksheet.getRow(currentRow).values = [`за період ${startDate} - ${endDate}`];
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  const periodCell = worksheet.getCell(currentRow, 1);
  periodCell.font = { size: 11, bold: true };
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(currentRow).height = 20;
  currentRow += 2;

  const headers = [
    { text: '№\nп/п', width: 5 },
    { text: '№ лічильника, місце\nвстановлення', width: 18 },
    { text: "Призначення обліку\n(назва об'єкту)", width: 20 },
    { text: 'СА\nСР\nГР', width: 8 },
    { text: 'Поточні\nпоказники', width: 12 },
    { text: 'Попередні\nпоказники', width: 12 },
    { text: 'Різниця', width: 10 },
    { text: 'Розрахунковий\nкоефіцієнт', width: 12 },
    { text: '% займаної\nплощі', width: 10 },
    { text: `Спожита\n${getResourceName(resourceType)}`, width: 15 },
  ];

  const headerRow = worksheet.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header.text;
    cell.font = { bold: true, size: 9 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    cell.border = getBorders();
    worksheet.getColumn(index + 1).width = header.width;
  });
  headerRow.height = 35;
  currentRow++;

  let totalConsumedCA = 0;
  let totalConsumedCP = 0;
  let totalConsumedGR = 0;

  readings.forEach((reading, index) => {
    const startRow = currentRow;

    const rawReading = reading.rawReading || reading;
    const distributions = rawReading.distributions || [];

    const caDistribution = distributions.find((d) => d.category === 'CA');
    const cpDistribution = distributions.find((d) => d.category === 'CP');
    const grDistribution = distributions.find((d) => d.category === 'GR');

    const coefficient = parseFloat(reading.coefficient) || 1;
    const areaPercent = parseFloat(reading.locationArea) || 100;

    const getDistData = (dist, coefficient, areaPercent) => {
      if (!dist) return { current: 0, previous: 0, diff: 0, consumed: 0 };

      const current = parseFloat(dist.current_reading) || 0;
      const previous = parseFloat(dist.previous_reading) || 0;

      let diff = parseFloat(dist.difference);
      if (!isFinite(diff)) {
        diff = current - previous;
      }

      let consumed = parseFloat(dist.consumed_energy) || 0;

      if (!isFinite(diff)) diff = 0;
      if (!isFinite(consumed)) consumed = 0;

      return { current, previous, diff, consumed };
    };
    const caData = getDistData(caDistribution, coefficient, areaPercent);
    const cpData = getDistData(cpDistribution, coefficient, areaPercent);
    const grData = getDistData(grDistribution, coefficient, areaPercent);
    
    const rowCA = worksheet.getRow(currentRow);
    rowCA.values = [
      index + 1,
      `${reading.installationPlace}\n${reading.meterNumber}`,
      reading.purpose,
      'СА',
      caData.current,
      caData.previous,
      caData.diff,
      coefficient,
      areaPercent,
      caData.consumed,
    ];
    currentRow++;

    const rowCP = worksheet.getRow(currentRow);
    rowCP.values = ['', '', '', 'СР', cpData.current, cpData.previous, cpData.diff, '', '', cpData.consumed];
    currentRow++;

    const rowGR = worksheet.getRow(currentRow);
    rowGR.values = ['', '', '', 'ГР', grData.current, grData.previous, grData.diff, '', '', grData.consumed];
    currentRow++;

    [rowCA, rowCP, rowGR].forEach((row, idx) => {
      row.eachCell((cell, colNum) => {
        cell.border = getBorders();
        cell.alignment = {
          horizontal: idx === 0 && colNum <= 3 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: idx === 0 && (colNum === 2 || colNum === 3),
        };
        if (colNum >= 5 && colNum <= 10 && cell.value !== '') {
          cell.numFmt = '0.000';
        }
      });
      row.height = 20;
    });

    worksheet.mergeCells(startRow, 1, startRow + 2, 1);
    worksheet.mergeCells(startRow, 2, startRow + 2, 2);
    worksheet.mergeCells(startRow, 3, startRow + 2, 3);
    worksheet.mergeCells(startRow, 8, startRow + 2, 8);
    worksheet.mergeCells(startRow, 9, startRow + 2, 9);

    totalConsumedCA += caData.consumed;
    totalConsumedCP += cpData.consumed;
    totalConsumedGR += grData.consumed;
  });

  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  const totalHeaderCell = worksheet.getCell(currentRow, 1);
  totalHeaderCell.value = `Загальна спожита потужність ${options.tenantCompany || 'орендаря'}, ${getResourceUnit(resourceType)}`;
  totalHeaderCell.font = { bold: true, size: 11 };
  totalHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
  totalHeaderCell.border = getBorders();
  currentRow++;

  const totalRowCA = worksheet.getRow(currentRow);
  totalRowCA.values = ['', 'СА', '', '', '', '', '', '', '', totalConsumedCA];
  totalRowCA.getCell(2).font = { bold: true };
  totalRowCA.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowCA.getCell(2).border = getBorders();
  totalRowCA.getCell(10).font = { bold: true, size: 11 };
  totalRowCA.getCell(10).numFmt = '0.000';
  totalRowCA.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowCA.getCell(10).border = getBorders();
  totalRowCA.getCell(10).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 1);
  worksheet.mergeCells(currentRow, 3, currentRow, 9);
  currentRow++;

  const totalRowCP = worksheet.getRow(currentRow);
  totalRowCP.values = ['', 'СР', '', '', '', '', '', '', '', totalConsumedCP];
  totalRowCP.getCell(2).font = { bold: true };
  totalRowCP.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowCP.getCell(2).border = getBorders();
  totalRowCP.getCell(10).font = { bold: true, size: 11 };
  totalRowCP.getCell(10).numFmt = '0.000';
  totalRowCP.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowCP.getCell(10).border = getBorders();
  totalRowCP.getCell(10).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 1);
  worksheet.mergeCells(currentRow, 3, currentRow, 9);
  currentRow++;

  const totalRowGR = worksheet.getRow(currentRow);
  totalRowGR.values = ['', 'ГР', '', '', '', '', '', '', '', totalConsumedGR];
  totalRowGR.getCell(2).font = { bold: true };
  totalRowGR.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowGR.getCell(2).border = getBorders();
  totalRowGR.getCell(10).font = { bold: true, size: 11 };
  totalRowGR.getCell(10).numFmt = '0.000';
  totalRowGR.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRowGR.getCell(10).border = getBorders();
  totalRowGR.getCell(10).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' },
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 1);
  worksheet.mergeCells(currentRow, 3, currentRow, 9);

  currentRow += 3;

  worksheet.getRow(currentRow).values = [
    '2. Сторони підтверджують правильність вказаних приладів обліку і їх показників, та не мають жодних заперечень до цього акту.',
  ];
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  const noteCell = worksheet.getCell(currentRow, 1);
  noteCell.font = { size: 10 };
  noteCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  worksheet.getRow(currentRow).height = 25;
  currentRow += 2;

  worksheet.getRow(currentRow).values = ['3. Підписи сторін:'];
  worksheet.mergeCells(currentRow, 1, currentRow, 12);
  worksheet.getCell(currentRow, 1).font = { size: 10, bold: true };
  worksheet.getCell(currentRow, 1).alignment = { horizontal: 'left', vertical: 'middle' };
  currentRow += 2;

  const orgRow = worksheet.getRow(currentRow);
  orgRow.values = [
    options.organization || 'ТОВ «Про Тек Вікна Україна»',
    '',
    '',
    '',
    '',
    '',
    '_______________',
    '',
    options.executorName || '',
  ];
  orgRow.height = 20;
  currentRow += 2;

  const tenantRow = worksheet.getRow(currentRow);
  tenantRow.values = [
    options.tenantCompany || 'ТОВ «ГалФрост»',
    '',
    '',
    '',
    '',
    '',
    '_______________',
    '',
    options.tenantRepresentative || '',
  ];
  tenantRow.height = 20;
  currentRow += 3;

  const execRow = worksheet.getRow(currentRow);
  execRow.values = [
    `Виконав: ${options.executorTitle || 'інж.-енергетик'}`,
    '',
    '',
    '',
    '_______________',
    '',
    options.executorName || '',
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const date = new Date(options.period || new Date());
  const fileName = `Акт_${resourceType}_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}.xlsx`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);

  return { success: true, fileName };
};

function getBorders() {
  return {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };
}

function getResourceGenitive(resourceType) {
  const map = {
    Електроенергія: 'електроенергії',
    Вода: 'води',
    Газ: 'газу',
  };
  return map[resourceType] || 'ресурсів';
}

function getResourceName(resourceType) {
  const map = {
    Електроенергія: 'електроенергія',
    Вода: 'вода',
    Газ: 'газ',
  };
  return map[resourceType] || 'ресурс';
}

function getResourceUnit(resourceType) {
  const map = {
    Електроенергія: 'кВт·год',
    Вода: 'м³',
    Газ: 'м³',
  };
  return map[resourceType] || 'од.';
}

function getPeriodDates(period) {
  if (!period) {
    const today = new Date();
    const formatted = today.toLocaleDateString('uk-UA');
    return [formatted, formatted];
  }

  const date = new Date(period);
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return [startDate.toLocaleDateString('uk-UA'), endDate.toLocaleDateString('uk-UA')];
}
