// Export HTML5 Canvas to PNG Image
export function exportCanvasToPNG(canvasElement, filename = 'apex-graph-export.png') {
  if (!canvasElement) return;
  try {
    const dataURL = canvasElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export canvas image:', err);
  }
}

// Export Data Table Array [{x, y}] to CSV file
export function exportTableToCSV(dataPoints, filename = 'graph-data.csv') {
  if (!dataPoints || !dataPoints.length) return;
  try {
    let csvContent = 'data:text/csv;charset=utf-8,X,Y\n';
    dataPoints.forEach(pt => {
      csvContent += `${pt.x},${pt.y}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export CSV:', err);
  }
}
