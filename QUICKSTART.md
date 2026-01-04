# Doc Decoupler - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### 1. Start the Server

Open a terminal and run:

```bash
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Decouple Project"
npx next dev
```

### 2. Open the App

Go to: **http://localhost:3000**

### 3. Upload PDFs

- Click on "Document A" box → Select first PDF
- Click on "Document B" box → Select second PDF
- Click **"Compare Documents"**

### 4. View Results

- Wait for processing (progress bar shows status)
- Review the comparison results
- Filter and sort matches as needed
- Apply manual overrides if needed
- Click **"Export JSON"** to download results

---

## 📋 Requirements

- Node.js 18+ installed
- Two PDF files to compare
- Modern web browser

---

## 🎯 What It Does

Compares two PDFs and shows:
- ✅ **Shared content** (appears in both)
- ✅ **Unique to A** (only in first PDF)
- ✅ **Unique to B** (only in second PDF)
- ✅ **Confidence scores** (how similar matches are)

---

## 💡 Tips

- Use **text-based PDFs** (not scanned images)
- **Remove encryption** from PDFs before uploading
- **Review fuzzy matches** - they may need verification
- **Use overrides** to correct any mistakes
- **Export JSON** for detailed analysis

---

## 📖 More Info

- **Full documentation**: See README.md
- **User guide**: See USAGE_GUIDE.md
- **Technical details**: See DEPLOYMENT.md
- **Project summary**: See PROJECT_SUMMARY.md

---

## ❓ Troubleshooting

**Server won't start?**
- Make sure you're in the correct directory
- Check that Node.js is installed: `node --version`

**Can't upload PDF?**
- Ensure file is actually a PDF (.pdf extension)
- Remove password protection if encrypted

**No matches found?**
- Documents might be completely different
- Check if PDFs are text-based (not scanned images)

---

## 🎉 That's It!

You're ready to compare PDFs. Enjoy!

**Current Status**: ✅ Server running at http://localhost:3000

