# Doc Decoupler - User Guide

## 🎯 What is Doc Decoupler?

Doc Decoupler is a web application that compares two PDF documents and identifies:
- **Shared content**: Text that appears in both documents
- **Unique content**: Text that appears in only one document
- **Match confidence**: How similar the shared content is (exact or fuzzy)

Perfect for:
- Comparing contract versions
- Finding duplicated content across documents
- Identifying unique clauses or sections
- Document diff analysis

## 🚀 Getting Started

### Step 1: Open the Application

1. Make sure the development server is running:
   ```bash
   cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Decouple Project"
   npx next dev
   ```

2. Open your browser and go to: **http://localhost:3000**

### Step 2: Upload Your PDFs

1. You'll see two upload boxes labeled "Document A" and "Document B"
2. Click on each box to select a PDF file, or drag and drop
3. The file name and size will appear once selected
4. Click the **"Compare Documents"** button

**Note**: Only PDF files are accepted. Encrypted PDFs will show an error.

### Step 3: Wait for Processing

- A progress bar will appear showing the current step
- Processing includes:
  - Loading PDFs
  - Extracting text from each page
  - Finding exact matches
  - Finding fuzzy matches
  - Organizing results

**Tip**: Large PDFs may take a minute or two. The UI remains responsive thanks to Web Workers!

### Step 4: Review Results

Once processing completes, you'll see:

#### Results Summary (Top Section)
- **Total Matches**: Number of lines found in both documents
- **Shared Units**: Total lines that matched
- **Unique to Doc A**: Lines only in Document A
- **Unique to Doc B**: Lines only in Document B

#### Compare View (Bottom Section)
- Side-by-side comparison of all matches
- Each match shows:
  - Match type badge (Exact or Fuzzy)
  - Confidence percentage
  - Text from Document A with page/line number
  - Text from Document B with page/line number

### Step 5: Filter and Sort

**Filter Options:**
- **All Matches**: Show everything
- **Exact**: Only 100% identical matches
- **Fuzzy**: Only similar matches (65%+ similarity)

**Sort Options:**
- **Confidence**: Highest confidence first (default)
- **Page Number**: Order by page in Document A

### Step 6: Apply Manual Overrides (Optional)

Sometimes the algorithm might make mistakes. You can manually adjust:

1. Find a match you want to change
2. Click **"Mark as Shared"** to confirm it's a match
3. Click **"Mark as Unique"** to say it's NOT a match
4. The statistics will update automatically
5. Your overrides are shown with a blue badge

### Step 7: Export Results

Click the **"Export JSON"** button to download a file containing:

- **Metadata**: Export date, file names, match statistics
- **Canonical Shared**: All shared content with locations
- **Unique by Doc**: Content unique to each document
- **All Matches**: Complete match details with confidence scores and overrides

The JSON file is named: `doc-comparison-YYYY-MM-DD.json`

### Step 8: Start a New Comparison

Click **"New Comparison"** to reset and upload different PDFs.

## 📊 Understanding Match Types

### Exact Matches (Green Badge)
- **Confidence**: 100%
- **Meaning**: Text is identical after normalization
- **Example**: 
  - Doc A: "Hello, World!"
  - Doc B: "hello world"
  - Result: Exact match (punctuation and case ignored)

### Fuzzy Matches (Yellow Badge)
- **Confidence**: 65% - 99%
- **Meaning**: Text is similar but not identical
- **Example**:
  - Doc A: "The quick brown fox jumps"
  - Doc B: "The quick brown fox leaps"
  - Result: Fuzzy match (~80% similarity)

### No Match
- Lines with less than 65% similarity are considered unique

## 🎨 UI Elements Explained

### Color Coding
- **Blue border**: Document A content
- **Red border**: Document B content
- **Green badge**: Exact match
- **Yellow badge**: Fuzzy match
- **Blue badge**: User override applied

### Buttons
- **Compare Documents**: Start the comparison
- **Export JSON**: Download results
- **New Comparison**: Reset and start over
- **Mark as Shared**: Override to mark as match
- **Mark as Unique**: Override to mark as non-match

## 💡 Tips & Best Practices

### For Best Results:
1. **Use text-based PDFs**: Scanned images won't work (OCR not included)
2. **Unencrypt PDFs**: Remove password protection before uploading
3. **Check file size**: Very large PDFs (100+ pages) may take longer
4. **Review fuzzy matches**: They might need manual verification
5. **Use overrides**: Correct any false positives or negatives

### Common Use Cases:

**Contract Comparison:**
- Upload old and new versions
- Find what changed (unique sections)
- Verify what stayed the same (shared sections)

**Duplicate Detection:**
- Upload two documents
- Check shared content percentage
- Identify copied sections

**Content Analysis:**
- Compare similar documents
- Find unique clauses or terms
- Export for further analysis

## 🔍 How It Works (Technical Overview)

### Text Extraction
1. PDF.js extracts text from each page
2. Text is split into lines based on Y-coordinates
3. Empty or very short lines are filtered out

### Normalization
Each line is normalized by:
- Converting to lowercase
- Removing punctuation
- Collapsing whitespace
- Creating a fingerprint hash

### Matching Pipeline

**Phase 1: Exact Matching**
- Uses fingerprint hashing
- O(n) time complexity
- Finds 100% identical content

**Phase 2: Fuzzy Matching**
- Tokenizes remaining text
- Calculates Jaccard similarity
- Matches lines with 65%+ similarity
- Finds best match for each line

### Result Organization
- Matched lines → Shared
- Unmatched lines → Unique to respective document
- User overrides applied last

## ❓ Troubleshooting

### "Please upload a PDF file"
- **Cause**: File is not a PDF
- **Solution**: Ensure file extension is .pdf

### "PDF is encrypted"
- **Cause**: PDF has password protection
- **Solution**: Remove encryption using PDF software

### "Failed to extract text"
- **Cause**: PDF might be corrupted or image-based
- **Solution**: Try a different PDF or convert to text-based PDF

### Processing takes too long
- **Cause**: Very large PDFs or many pages
- **Solution**: Wait patiently, or split PDF into smaller chunks

### No matches found
- **Possible reasons**:
  - Documents are completely different
  - Text is formatted very differently
  - One or both PDFs are image-based (no extractable text)

### Too many false matches
- **Solution**: Use the override buttons to mark incorrect matches as unique
- **Note**: Consider adjusting the fuzzy threshold (requires code change)

## 📋 Keyboard Shortcuts

Currently, the app is mouse/touch-driven. Future versions may include:
- Arrow keys for navigation
- Enter to confirm actions
- Escape to close modals

## 🔒 Privacy & Security

- **100% Client-Side**: Your PDFs never leave your computer
- **No Uploads**: Everything processes in your browser
- **No Storage**: Nothing is saved or tracked
- **No Analytics**: Your data is private

## 📱 Mobile Support

The app is responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ⚠️ Mobile phones (works but small screen may be challenging)

**Recommendation**: Use a desktop or tablet for best experience.

## 🎓 Example Workflow

**Scenario**: Comparing two contract versions

1. **Upload**: Select contract_v1.pdf and contract_v2.pdf
2. **Process**: Wait for extraction and matching
3. **Review Summary**: 
   - 150 total matches
   - 200 shared units
   - 25 unique to v1
   - 30 unique to v2
4. **Examine Unique Content**: 
   - Filter to see what's only in v2 (new clauses)
   - Check what was removed from v1
5. **Verify Fuzzy Matches**:
   - Sort by confidence
   - Review low-confidence matches
   - Apply overrides if needed
6. **Export**: Download JSON for records
7. **Share**: Send JSON to colleagues for review

## 📞 Support

For issues or questions:
1. Check this guide
2. Review README.md
3. Check code comments in source files
4. Review DEPLOYMENT.md for technical details

## 🎉 Enjoy!

Doc Decoupler makes document comparison easy and visual. Happy comparing!

