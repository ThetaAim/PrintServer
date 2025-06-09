const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

require('dotenv').config();

const port = process.env.PORT || 3000;
const cliclickPath = process.env.CLICLICK_PATH || '/opt/homebrew/bin/cliclick';
const printerDefault = process.env.PRINTER_DEFAULT || 'color';

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const username = req.body.username || 'unknown';
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const fileName = `${baseName}-${username}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// AppleScript automation
const moveWindowAndType = (username, password) => {
  const script = `
    tell application "System Events"
      tell process "YSoft SafeQ Client"
        set frontWindow to first window
        set position of frontWindow to {0, 0}
      end tell
    end tell

    do shell script "${cliclickPath} c:105,100"
    tell application "System Events" to keystroke "${username}"

    delay 0.5
    do shell script "${cliclickPath} c:105,140"
    tell application "System Events" to keystroke "${password}"

    delay 0.5
    do shell script "${cliclickPath} c:355,210"
  `;

  exec(`osascript -e '${script}'`, (err, stdout, stderr) => {
    if (err) {
      console.log(`AppleScript error: ${err}`);
      return;
    }
    console.log(`AppleScript executed: ${stdout}`);
  });
};

// Send print command
function sendPrintCommand(filePath, username, password, category) {
  let cmd = '';

  switch (category) {
    // ------Color
    case 'C_A3_100gr_color':
            cmd = `lp -d ${printerDefault} -o EFPrintSize=A3 -o Collate=False -o InputSlot=Tray2 -o EFMediaType=Recycled -o EFMediaWeight=81 -o EFColorMode=Color -o EFDuplex=False -o EFOutputBin=AutoSelect -o EFTrayAlignment=True -o page-ranges=1 -o copies=1 ${filePath}`;
            break;
        case 'C_A3_80gr_color':
            cmd = `lp -d ${printerDefault} -o EFPrintSize=A3 -o Collate=False -o InputSlot=Tray2 -o EFMediaType=Recycled -o EFMediaWeight=81 -o EFColorMode=Color -o EFDuplex=False -o EFOutputBin=AutoSelect -o EFTrayAlignment=True -o page-ranges=1 -o copies=1 ${filePath}`;
            break;
        case 'C_A4_100gr_color':
            cmd = `lp -d ${printerDefault} -o EFPrintSize=A4 -o Collate=False -o InputSlot=Tray2 -o EFMediaType=Recycled -o EFMediaWeight=81 -o EFColorMode=Color -o EFDuplex=False -o EFOutputBin=AutoSelect -o EFTrayAlignment=True -o page-ranges=1 -o copies=1 ${filePath}`;
            break;
        case 'C_A4_80gr_color':
            cmd = `lp -d ${printerDefault} -o EFPrintSize=A4 -o Collate=False -o InputSlot=Tray2 -o EFMediaType=Plain -o EFMediaWeight=80 -o EFColorMode=Color -o EFDuplex=False -o EFOutputBin=AutoSelect -o EFTrayAlignment=True -o page-ranges=1 -o copies=1 ${filePath}`;
            break;
    // ------Fiery media-type=Plain
        case 'F_A3_100gr':
            cmd = `lp -d Fiery -o EFPrintSize=A3 -o EFMediaWeight=80_105 -o EFMediaType=Plain -o EFTrayAlignment=True -o inputslot=Tray3 -o copies=1 -o EFColorMode=CMYK -o sides=one-sided -o resolution=1200x1200dpi -o page-ranges=1- -o EFOutputBin=AutoSelect ${filePath}`;
            break;
        case 'F_A3_160gr':
            cmd = `lp -d Fiery -o EFPrintSize=A3 -o EFMediaWeight=163_220 -o EFMediaType=CoatedMatteLaser -o EFTrayAlignment=True -o InputSlot=Tray5 -o copies=1 -o EFColorMode=CMYK -o sides=one-sided -o resolution=1200x1200dpi -o page-ranges=1- -o EFOutputBin=AutoSelect -o page-left=50 -o page-right=50 ${filePath}`;
            break;
        case 'F_A3_80gr_recycled':
            cmd = `lp -d Fiery -o EFPrintSize=A3 -o EFMediaWeight=63_80 -o EFMediaType=Recycled -o EFTrayAlignment=True -o inputslot=Tray2 -o copies=1 -o EFColorMode=CMYK -o sides=one-sided -o resolution=1200x1200dpi -o page-ranges=1- -o EFOutputBin=AutoSelect ${filePath}`;
            break;
        case 'F_A3_Plus_300gr':
            cmd = `lp -d Fiery -o EFPrintSize=SRA3 -o EFMediaWeight=256_300 -o EFMediaType=CoatedMatteLaser -o EFTrayAlignment=True -o inputslot=Tray4 -o copies=1 -o EFColorMode=CMYK -o sides=one-sided -o resolution=1200x1200dpi -o page-ranges=1- -o EFOutputBin=AutoSelect ${filePath}`;
            break;
    default:
      console.log('Unknown category:', category);
      return;
  }

  exec(cmd, (err, stdout) => {
    if (err) {
      console.error('Print error:', err);
      return;
    }
    console.log('Printed:', stdout);
    setTimeout(() => moveWindowAndType(username, password), 1500);
  });
}

// Upload endpoint
app.post('/upload', upload.single('fileUpload'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const { username = 'unknown', password = '', printCategory = '' } = req.body;
  const oldPath = req.file.path;
  const newPath = path.join('uploads', `${username}-${path.basename(oldPath)}`);

  fs.rename(oldPath, newPath, (err) => {
    if (err) return res.status(500).send('Rename failed.');

    res.json({ message: 'Uploaded and renamed', filename: newPath });
    sendPrintCommand(newPath, username, password, printCategory);
  });
});

// Static files
app.use(express.static('public'));

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port}`);
});
