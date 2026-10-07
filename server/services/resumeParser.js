const pdf = require('pdf-parse');

/**
 * Extracts raw text from an in-memory PDF buffer and summarizes key skills/projects
 */
const parseResumePdf = async (buffer) => {
  try {
    const data = await pdf(buffer);
    const rawText = data.text || '';

    // Clean whitespace and limit to ~3000 chars for AI context prompt
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return cleanedText.substring(0, 3000);
  } catch (error) {
    console.error('Resume PDF parsing failed:', error.message);
    return null;
  }
};

module.exports = { parseResumePdf };
