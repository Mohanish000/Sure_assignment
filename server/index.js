const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseStatement } = require('./parser');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'statement-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.post('/api/parse', upload.single('statement'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const result = await parseStatement(filePath);

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            data: result,
            filename: req.file.originalname
        });

    } catch (error) {
        console.error('Parse error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse statement'
        });
    }
});

app.post('/api/parse-batch', upload.array('statements', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];

        for (const file of req.files) {
            try {
                const result = await parseStatement(file.path);
                results.push({
                    filename: file.originalname,
                    status: 'success',
                    data: result
                });
                fs.unlinkSync(file.path);
            } catch (error) {
                results.push({
                    filename: file.originalname,
                    status: 'failed',
                    error: error.message
                });
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        res.json({
            success: true,
            results: results,
            total: req.files.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length
        });

    } catch (error) {
        console.error('Batch parse error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse statements'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Parser API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
