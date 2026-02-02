// Utility functions for CSV export

interface CSVData {
  [key: string]: any;
}

export const convertToCSV = (data: CSVData[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeader = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeader, ...csvRows].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportFishPredictionsToCSV = (predictions: any[]) => {
  const csvData = predictions.map(prediction => ({
    Date: prediction.date || new Date(prediction.created_at).toLocaleString(),
    Species: prediction.species,
    'Quality Grade': prediction.grade || prediction.quality_grade,
    'Market Value ($/lb)': prediction.value || parseFloat(prediction.market_value) || 0,
    'Confidence (%)': prediction.confidence,
    'Handling Instructions': prediction.handling || prediction.handling_instructions,
    'Was Correct': prediction.was_correct !== null ? (prediction.was_correct ? 'Yes' : 'No') : 'Not reviewed',
    'Corrected Species': prediction.corrected_species || '-',
    'Corrected Grade': prediction.corrected_grade || '-'
  }));

  const csvContent = convertToCSV(csvData);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `fish-predictions-${timestamp}.csv`);
};
