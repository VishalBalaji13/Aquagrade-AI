import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FishPrediction {
  id: string;
  species: string;
  quality_grade: string;
  confidence: number | null;
  created_at: string;
  market_value: string | null;
  handling_instructions: string | null;
  corrected_species: string | null;
  corrected_grade: string | null;
  was_correct: boolean | null;
}

export const exportFishPredictionsToPDF = (predictions: FishPrediction[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Fish Analysis History', 14, 22);
  
  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
  doc.text(`Total Records: ${predictions.length}`, 14, 38);
  
  // Prepare table data
  const tableData = predictions.map(pred => [
    new Date(pred.created_at).toLocaleDateString(),
    pred.species,
    pred.quality_grade,
    pred.confidence ? `${(pred.confidence * 100).toFixed(1)}%` : 'N/A',
    pred.market_value || 'N/A',
    pred.was_correct === null ? 'Not Reviewed' : pred.was_correct ? 'Correct' : 'Incorrect'
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Date', 'Species', 'Grade', 'Confidence', 'Market Value', 'Feedback']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 101, 216] }
  });
  
  // Save the PDF
  doc.save(`fish-predictions-${new Date().toISOString().split('T')[0]}.pdf`);
};
