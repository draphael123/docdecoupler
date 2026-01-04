# Doc Decoupler - Quick Start Instructions

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Usage Guide

### Step 1: Upload Documents
1. Click on the "Document A" file input and select your first PDF
2. Click on the "Document B" file input and select your second PDF
3. Click "Compare Documents" button

### Step 2: Processing
- Watch the progress bar as the app:
  - Extracts text from both PDFs
  - Performs exact matching
  - Performs fuzzy matching
  - Organizes results

### Step 3: Review Results
The results page shows:
- **Summary Statistics**: Total matches, shared units, unique content counts
- **Match List**: All matches with confidence scores and match types

### Step 4: Refine Results (Optional)
For each match, you can:
- Click "Mark as Shared" to confirm it's shared content
- Click "Mark as Unique" to indicate it should be treated as unique
- Filter matches by type (All/Exact/Fuzzy)
- Sort by confidence or page number

### Step 5: Export
Click the "Export JSON" button to download a comprehensive report containing:
- All shared content with page/line references
- Unique content from each document
- Match details with confidence scores
- User overrides

## Tips

- **File Size**: Works best with PDFs under 50MB
- **Text-Based PDFs**: Ensure PDFs contain actual text (not scanned images)
- **Encrypted PDFs**: Not supported - use unencrypted versions
- **Fuzzy Threshold**: Default 65% similarity - contact support to adjust

## Troubleshooting

### "PDF is encrypted" Error
- Remove password protection from your PDF
- Try opening in Adobe Acrobat and "Save As" unencrypted

### No Matches Found
- Verify both PDFs contain extractable text
- Check that PDFs aren't just images
- Try with documents you know have shared content

### Processing Stuck
- Refresh the page and try again
- Check browser console for errors
- Try with smaller PDF files first

### Browser Compatibility
- Use latest version of Chrome, Firefox, Edge, or Safari
- Clear browser cache if experiencing issues

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review browser console for error messages
3. Ensure PDFs meet requirements (text-based, unencrypted)

