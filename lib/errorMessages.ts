/**
 * User-friendly error messages
 */

export const ErrorMessages = {
  ENCRYPTED_PDF: {
    title: 'PDF is Encrypted',
    message: 'This PDF file is password-protected. Please remove the password protection and try again.',
    suggestion: 'You can use PDF software like Adobe Acrobat or online tools to remove password protection.',
  },
  INVALID_FILE: {
    title: 'Invalid File Type',
    message: 'Please upload a PDF file (.pdf extension).',
    suggestion: 'Make sure the file has a .pdf extension and is a valid PDF document.',
  },
  EMPTY_PDF: {
    title: 'Empty PDF',
    message: 'This PDF file appears to be empty or contains no extractable text.',
    suggestion: 'The PDF might be image-based (scanned). Try using OCR software to extract text first.',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'The PDF file is too large to process.',
    suggestion: 'Try splitting the PDF into smaller files or compressing it.',
  },
  PROCESSING_ERROR: {
    title: 'Processing Error',
    message: 'An error occurred while processing the PDF files.',
    suggestion: 'Please try again. If the problem persists, check that both files are valid PDFs.',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Unable to load required resources.',
    suggestion: 'Please check your internet connection and try again.',
  },
};

export function getErrorMessage(error: Error | string): { title: string; message: string; suggestion: string } {
  const errorString = typeof error === 'string' ? error : error.message;
  
  if (errorString.includes('encrypted') || errorString.includes('password')) {
    return ErrorMessages.ENCRYPTED_PDF;
  }
  
  if (errorString.includes('empty') || errorString.includes('no text')) {
    return ErrorMessages.EMPTY_PDF;
  }
  
  if (errorString.includes('too large') || errorString.includes('size')) {
    return ErrorMessages.FILE_TOO_LARGE;
  }
  
  return ErrorMessages.PROCESSING_ERROR;
}

