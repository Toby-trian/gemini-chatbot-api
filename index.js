import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json());

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body; 
    if (!prompt || typeof prompt !== 'string') { 
        res.status(400).json({
            success: false,
            message: 'Prompt harus berupa string!',
            data: null
        });
        return;
    }
    try {
       const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {text: prompt}
        ],
        config: {
            systemInstruction: 'Harus dibalas dalam bahasa Indonesia'
        }
       }); 
       res.status(200).json({
            success: true,
            message: 'Berhasil dijawab dengan gemini',
            data: aiResponse.text
       })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Gagal tersambung ke server',
            data: null
        })
    }
});

app.listen(3000, () => {
    console.log('Gemini AI');
})