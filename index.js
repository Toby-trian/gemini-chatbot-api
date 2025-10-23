import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { error } from 'node:console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer();
const ai = new GoogleGenAI({});

app.use(cors());
app.use(express.json());
app.use(
    express.static(
        path.join(__dirname, 'static'),
    ),
);

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

app.post("/api/chat", async (req, res) => {
    const { conversation }  = req.body;
    try {
        if(!Array.isArray(conversation)) {
            throw new Error("Conversation harus berupa array!");
        }

        let messageIsValid = true;

        if(conversation.length === 0) {
            throw new Error("Conversation tidak boleh kosong!");
        }

        conversation.forEach(message => {
            

            if (!message || typeof message !== 'object') {
                messageIsValid = false;
                return;
            }

            const keys = Object.keys(message);
            const objectHasValidKeys =  keys.every(key => 
                ['text', 'role'].includes(key)
            );

            if (keys.length !==2 || !objectHasValidKeys) {
                messageIsValid = false;
                return;
            }

            const { text, role} = message;

            if(!["model", "user"].includes(role)) {
                messageIsValid = false;
                return;
            }

            if(!text || typeof text !== 'string') {
                messageIsValid = false;
                return;
            }
        });

        if(!messageIsValid) {
            throw new Error("Message harus valid!");
        }

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: "Nama kamu Agent Hunt, asisten AI seperti Jarvis dari Iron Man. Berbicara dalam bahasa Indonesia, dengan gaya sopan, cerdas, dan profesional, siap membantu dan menjawab setiap perintah dengan percaya diri."
            }
        });

        res.status(200).json({
            success: true,
            message: "Berhasil dibalas oleh google gemini!",
            data: aiResponse.text
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
            data: null,
        });
    }
});

app.listen(3000, () => {
    console.log('Gemini AI');
})