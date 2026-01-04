# Document Builder Feature

## 🎉 New Feature: Create New Documents from Decoupled Content

A powerful new feature that allows users to create new PDF or text documents by selecting which decoupled content to include.

---

## ✨ Features

### **Content Selection**
- ✅ Select Shared Content (content found in both documents)
- ✅ Select Unique to Document A
- ✅ Select Unique to Document B
- ✅ Mix and match any combination

### **Document Options**
- ✅ **PDF Format**: Professional PDF documents with formatting
- ✅ **Text Format**: Simple .txt files for easy editing
- ✅ **Custom Title**: Add your own document title
- ✅ **Page Numbers**: Include original page numbers
- ✅ **Source Information**: Include metadata about sources

### **Smart Organization**
- Content automatically sorted by original page number
- Section headers for each content type
- Professional formatting and layout
- Footer with generation information

---

## 📍 Location in UI

The Document Builder appears **between** the Results Summary and Compare View sections, after a comparison is complete.

**Flow:**
1. Upload PDFs → Extract → Match
2. View Results Summary
3. **Create New Document** ← NEW!
4. View Compare View

---

## 🎯 How to Use

### Step 1: Complete a Comparison
- Upload two PDF files
- Wait for processing to complete
- Review the results

### Step 2: Open Document Builder
- Scroll to the "Create New Document" section
- It appears automatically after results are ready

### Step 3: Configure Your Document

**Choose Format:**
- PDF Document (recommended for professional use)
- Text File (.txt) (for easy editing)

**Set Title (Optional):**
- Enter a custom title like "Merged Document" or "Comparison Report"
- If left empty, defaults to "Generated Document"

**Select Content:**
- ☑️ Shared Content - Content found in both documents
- ☑️ Unique to Document A - Only in first document
- ☑️ Unique to Document B - Only in second document

**Choose Options:**
- ☑️ Include page numbers - Shows original page numbers
- ☑️ Include source information - Adds metadata header

### Step 4: Preview Stats
- See total lines that will be included
- Breakdown by content type
- Ensure at least one content type is selected

### Step 5: Generate
- Click "Generate PDF Document" or "Generate TXT Document"
- File downloads automatically
- Filename includes date: `your_title_2026-01-04.pdf`

---

## 📄 Document Format

### PDF Documents Include:
1. **Title Page** (if provided)
2. **Source Information Section** (if enabled)
   - Lists which sections are included
   - Generation timestamp
3. **Content Sections** (in order):
   - **Shared Content** (if selected)
   - **Unique to Document A** (if selected)
   - **Unique to Document B** (if selected)
4. **Formatting**:
   - Section headers (bold, larger font)
   - Page numbers (if enabled, in gray italic)
   - Proper line spacing
   - Page breaks as needed
   - Footer on each page with page numbers

### Text Documents Include:
- Plain text format
- Section headers with === markers
- Page numbers in brackets (if enabled)
- Easy to edit in any text editor

---

## 💡 Use Cases

### 1. **Create Merged Document**
- Select: Shared + Unique A + Unique B
- Result: Complete combined document

### 2. **Extract Only New Content**
- Select: Unique to Document B only
- Result: Only new content from second document

### 3. **Create Comparison Report**
- Select: Shared + Unique A + Unique B
- Enable: Page numbers + Source info
- Result: Professional comparison document

### 4. **Extract Unique Clauses**
- Select: Unique to Document A
- Result: Only clauses unique to first document

---

## 🔧 Technical Details

### **Files Created/Modified**

1. **lib/documentGenerator.ts** (NEW)
   - `generateDocument()` - Creates PDF using jsPDF
   - `generateTextDocument()` - Creates .txt file
   - `getContentStats()` - Calculates preview statistics

2. **components/DocumentBuilder.tsx** (NEW)
   - Full UI component for document creation
   - Selection interface
   - Preview statistics
   - Generate button

3. **lib/types.ts** (MODIFIED)
   - Added `DocumentSelection` interface
   - Added `DocumentContent` interface

4. **app/page.tsx** (MODIFIED)
   - Integrated DocumentBuilder component
   - Appears after Results Summary

5. **package.json** (MODIFIED)
   - Added `jspdf@2.5.1` dependency

### **Dependencies**
- **jsPDF**: Client-side PDF generation
- No server required - all processing in browser

---

## 🎨 UI Features

### **Visual Design**
- Clean, card-based layout
- Consistent with app design
- Responsive (mobile-friendly)
- Clear section organization

### **User Experience**
- Real-time preview statistics
- Clear checkboxes and radio buttons
- Disabled state when no content selected
- Loading state during generation
- Error handling with user-friendly messages

### **Accessibility**
- Proper labels for all inputs
- Keyboard navigation support
- Screen reader friendly
- Clear visual feedback

---

## 📊 Statistics Preview

Before generating, users see:
- **Total Lines**: Total content to be included
- **Shared**: Number of shared lines (if selected)
- **Unique A**: Number of unique A lines (if selected)
- **Unique B**: Number of unique B lines (if selected)

This helps users understand what they're creating before generating.

---

## 🚀 Performance

- **Client-side only**: No server uploads
- **Fast generation**: PDF/text created instantly
- **Efficient**: Only processes selected content
- **No blocking**: UI remains responsive

---

## 🔒 Privacy & Security

- ✅ **100% client-side**: Documents generated in browser
- ✅ **No uploads**: Content never leaves your computer
- ✅ **No storage**: Documents only saved when you download
- ✅ **Private**: Perfect for sensitive documents

---

## 🐛 Error Handling

The feature handles:
- ✅ No content selected (shows warning, disables button)
- ✅ Generation errors (shows user-friendly message)
- ✅ Large documents (handles page breaks automatically)
- ✅ Empty sections (skips if no content)

---

## 📝 Example Workflow

**Scenario**: Create a document with only new content from Document B

1. Upload two contract versions
2. Complete comparison
3. Open Document Builder
4. Select format: PDF
5. Set title: "New Clauses Only"
6. Uncheck: Shared Content
7. Uncheck: Unique to Document A
8. Check: Unique to Document B
9. Enable: Page numbers
10. Click "Generate PDF Document"
11. Download: `New_Clauses_Only_2026-01-04.pdf`

**Result**: PDF containing only content unique to the second document, with page numbers showing where each clause came from.

---

## 🎯 Future Enhancements (Possible)

- [ ] Custom section ordering
- [ ] Filter by confidence score
- [ ] Include/exclude specific matches
- [ ] Custom formatting options
- [ ] Multiple document formats (Word, HTML)
- [ ] Batch generation
- [ ] Template selection

---

## ✅ Testing Checklist

- [x] PDF generation works
- [x] Text generation works
- [x] Content selection works
- [x] Options (page numbers, source info) work
- [x] Custom titles work
- [x] Statistics preview accurate
- [x] Error handling works
- [x] UI responsive on mobile
- [x] Build successful
- [x] No TypeScript errors
- [x] No linting errors

---

## 📚 Related Documentation

- **README.md**: Main project documentation
- **USAGE_GUIDE.md**: How to use the app
- **DEPLOYMENT.md**: Deployment information

---

## 🎉 Summary

The Document Builder feature adds powerful document creation capabilities to Doc Decoupler, allowing users to:

1. **Select** which decoupled content to include
2. **Customize** document format and options
3. **Generate** professional PDFs or text files
4. **Download** instantly with proper formatting

**All client-side, private, and fast!**

---

**Feature Status**: ✅ **Complete and Ready to Use!**

