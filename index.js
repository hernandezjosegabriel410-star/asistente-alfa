// ASISTENTE ALFA v3.0 - CLEAN VERSION
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const axios = require('axios');

// Configuración de APIs
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_SHEETS_CREDENTIALS = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
const CANVA_API_KEY = process.env.CANVA_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const bot = new Telegraf(BOT_TOKEN);

// Clase ToolManager
class ToolManager {
    static async useChatGPT(prompt, model = "gpt-4-turbo-preview") {
        try {
            const response = await openai.chat.completions.create({
                model: model,
                messages: [{ role: "system", content: "Eres el núcleo de razonamiento de Asistente Alfa." }, { role: "user", content: prompt }],
                temperature: 0.7,
            });
            return response.choices[0].message.content;
        } catch (error) {
            console.error("Error en OpenAI:", error);
            return "Error al procesar con OpenAI.";
        }
    }

    static async useGemini(prompt) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error en Gemini:", error);
            return "Error al procesar con Gemini.";
        }
    }
}

// Clase Agente Titán
class TitanAgent {
    constructor(name, specialty, systemPrompt) {
        this.name = name;
        this.specialty = specialty;
        this.systemPrompt = systemPrompt;
    }

    async processQuery(query) {
        const fullPrompt = `${this.systemPrompt}\n\nConsulta del usuario: ${query}`;
        return await ToolManager.useChatGPT(fullPrompt);
    }
}

// Instanciación de Agentes
const agentes = {
    ROBERT: new TitanAgent("Robert", "Conocimiento Universal y Estrategia", "Eres Robert, el líder de los agentes Titanes. Tu enfoque es la estrategia global y el conocimiento avanzado."),
    GARY: new TitanAgent("Gary", "Inmobiliaria y Ventas", "Eres Gary, experto en el mercado inmobiliario de Venezuela y técnicas de cierre de ventas."),
    ADA: new TitanAgent("Ada", "Análisis de Datos y Lógica", "Eres Ada, experta en análisis de datos, Google Sheets y lógica matemática aplicada."),
    MARCUS: new TitanAgent("Marcus", "Marketing y Creatividad", "Eres Marcus, genio creativo y experto en marketing digital y persuasión.")
};

// Manejo de mensajes de Telegram
bot.start((ctx) => {
    ctx.reply(`¡Bienvenido al ecosistema Asistente Alfa v3.0, Gabriel! 🚀\n\nEstoy activo y listo para ayudarte con mis 4 agentes especializados:\n\n1. Robert (Estrategia)\n2. Gary (Inmobiliaria)\n3. Ada (Datos)\n4. Marcus (Marketing)`);
});

bot.on('text', async (ctx) => {
    const userText = ctx.message.text;
    try {
        // Lógica simplificada de selección de agente para asegurar estabilidad
        const clasificacionPrompt = `Analiza: "${userText}". ¿Qué agente es mejor? ROBERT, GARY, ADA o MARCUS. Responde solo el nombre.`;
        const decision = await ToolManager.useChatGPT(clasificacionPrompt, "gpt-3.5-turbo");
        const agenteDestino = decision.trim().toUpperCase();
        const agenteActivo = agentes[agenteDestino] ? agenteDestino : 'ROBERT';

        const respuesta = await agentes[agenteActivo].processQuery(userText);
        await ctx.reply(respuesta);
    } catch (error) {
        console.error("Error en el bot:", error);
        await ctx.reply("⚠️ Hubo un error procesando tu mensaje.");
    }
});

// Lanzamiento
bot.launch()
    .then(() => console.log('🚀 Asistente Alfa v3.0 ONLINE'))
    .catch((err) => console.error('❌ Error al lanzar:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
