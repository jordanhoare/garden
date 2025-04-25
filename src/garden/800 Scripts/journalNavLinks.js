/**
 * Creates navigation links for journal entries
 * @param {object} tp - The Templater object providing access to file data
 * @returns {string} Navigation links to previous day, Daily Notes, and next day
 */
function journalNavLinks(tp) {
  // Get the current file's date (from filename or creation date)
  let currentDate;
  
  // Try to extract date from filename (assuming YYYY-MM-DD format)
  const fileNameMatch = tp.file.title.match(/(\d{4}-\d{2}-\d{2})/);
  if (fileNameMatch) {
    currentDate = moment(fileNameMatch[1]);
  } else {
    // If filename doesn't contain a date, use file creation date
    currentDate = moment(tp.file.creation_date, "YYYY-MM-DD");
  }
  
  // Calculate previous and next days
  const previousDay = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
  const nextDay = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
  
  // Check if we're in the Journal folder
  let journalPrefix = '';
  const filePath = tp.file.path;
  if (filePath.includes('Journal/')) {
    // Extract the journal path prefix if it exists
    const pathParts = filePath.split('Journal/');
    if (pathParts.length > 1) {
      journalPrefix = pathParts[0] + 'Journal/';
    }
  }
  
  // Create navigation links with proper Journal/ prefix if needed
  const prevLink = `[[${journalPrefix}${previousDay}|<< Previous]]`;
  const homeLink = `[[Daily Notes]]`;
  const nextLink = `[[${journalPrefix}${nextDay}|Next >>]]`;
  
  // Return the navigation bar
  return `${prevLink} | ${homeLink} | ${nextLink}`;
}

module.exports = journalNavLinks;
