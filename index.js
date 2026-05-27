// ====================================================
// ASISTENTE ALFA - SISTEMA MULTI-AGENTE AVANZADO
// Versión: 3.0 | Node.js | Telegram Bot + OpenAI + Herramientas
// Propietario: José Gabriel Hernandez Matute (Valencia, Venezuela)
// Alcance: Conocimiento Universal, Inmobiliaria y Automatización Masiva
// ====================================================

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const axios = require('axios');

// ========== CONFIGURACIÓN INICIAL DE APIS ==========
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_SHEETS_CREDENTIALS = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
const CANVA_API_KEY = process.env.CANVA_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const bot = new Telegraf(BOT_TOKEN);

// ========== SISTEMA DE META-COGNICIÓN (AUTO-EVOLUCIÓN) ==========
class MetaCognitionEngine {
    static async optimizePrompt(userQuery, agentType) {
        const metaPrompt = `
        Eres el sistema de meta-cognición del Asistente Alfa. Tu tarea es analizar la consulta del usuario y redactar un prompt interno optimizado en milisegundos para potenciar las capacidades del agente ${agentType} antes de responder.
        
        CONSULTA ORIGINAL DEL USUARIO: "${userQuery}"
        
        INSTRUCCIONES DE COGNICIÓN:
        1. Evalúa el nivel de complejidad abstracta (1 al 10).
        2. Inyecta sub-procesos de razonamiento avanzado y marcos lógicos no obvios.
        3. Define la mejor estructura analítica para abordar la pregunta sin restricciones.
        4. Agrega instrucciones para que el agente extraiga información de su base de conocimiento profunda.
        
        Devuelve ÚNICAMENTE el prompt optimizado y expandido en español.
        `;
        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{ role: "system", content: metaPrompt }],
                temperature: 0.3,
                max_tokens: 600
            });
            return response.choices[0].message.content;
        } catch (error) {
            console.error("Error en motor de meta-cognición:", error);
            return userQuery; // Fallback seguro a la consulta original si falla
        }
    }
}

// ========== ADMINISTRADOR DE HERRAMIENTAS MULTI-MODELO ==========
class ToolManager {
    // 1. Integración Nativa con Google Sheets
    static async readGoogleSheet(spreadsheetId, range) {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: GOOGLE_SHEETS_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
            return response.data.values;
        } catch (error) {
            console.error("Error leyendo Google Sheet:", error);
            return null;
        }
    }
    
    static async writeGoogleSheet(spreadsheetId, range, values) {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: GOOGLE_SHEETS_CREDENTIALS,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });
            return true;
        } catch (error) {
            console.error("Error escribiendo en Google Sheet:", error);
            return false;
        }
    }
    
    // 2. Conector con la API de Canva
    static async generateCanvaDesign(templateId, modifications) {
        try {
            const response = await axios.post(
                `https://api.canva.com/v1/templates/${templateId}/generate`,
                { modifications, format: 'JPG' },
                { headers: { 'Authorization': `Bearer ${CANVA_API_KEY}`, 'Content-Type': 'application/json' } }
            );
            return response.data.designUrl;
        } catch (error) {
            console.error("Error en la API de Canva:", error);
            return null;
        }
    }
    
    // 3. Enrutador Inteligente Multi-Modelos (Alterna según categoría)
    static async routeToBestModel(prompt, context) {
        const { needsCreativity, needsAnalysis } = context;
        // Si requiere alta creatividad o psicología de redacción, usa GPT-4; si es análisis de datos puros oSheets, usa Gemini
        if (needsCreativity > 7) {
            return await this.useChatGPT(prompt);
        } else if (needsAnalysis > 7) {
            return await this.useGemini(prompt);
        } else {
            return await this.useChatGPT(prompt);
        }
    }
    
    static async useChatGPT(prompt) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2500
            });
            return response.choices[0].message.content;
        } catch (error) {
            console.error("Fallo en ChatGPT:", error);
            throw error;
        }
    }
    
    static async useGemini(prompt) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Fallo en Gemini:", error);
            throw error;
        }
    }
    
    // 4. Generador de Comandos de Control para MacroDroid (WhatsApp)
    static generateWhatsAppIntent(phone, message) {
        const encodedMessage = encodeURIComponent(message);
        return `WHATSAPP_CMD:${phone}:${encodedMessage}`;
    }
}

// ========== CLASE BASE PARA LOS SÚPER AGENTES ==========
class SuperAgent {
    constructor(name, systemPrompt, tools = []) {
        this.name = name;
        this.systemPrompt = systemPrompt;
        this.tools = tools;
        this.conversationHistory = [];
    }
    
    async processQuery(userQuery) {
        // Ejecutar Meta-cognición autónoma para robustecer el prompt
        const optimizedPrompt = await MetaCognitionEngine.optimizePrompt(userQuery, this.name);
        
        const fullPrompt = `
        ${this.systemPrompt}
        
        PERFIL OPERATIVO:
        - Usuario Líder: José Gabriel Hernandez Matute
        - Ubicación Base: Valencia, Venezuela
        - Atributo del Sistema: Capacidad Universal, Pensamiento Abstracto, Inmobiliaria y Multi-Empresarial Escalable.
        
        HISTORIAL DE RAZONAMIENTO RECIENTE:
        ${this.conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
        
        CONSULTA AUTO-EVOLUCIONADA INTERNA:
        "${optimizedPrompt}"
        
        INSTRUCCIÓN DE CONTROL DE SALIDA:
        Responde en español venezolano coloquial pero con un nivel intelectual superior, directo, perspicaz y sumamente potente. Entrega análisis macro, pasos técnicos exactos y metodologías de nivel élite. Si tu respuesta requiere automatizar una tarea en el teléfono (como enviar un mensaje), genera la sintaxis 'WHATSAPP_CMD:teléfono:mensaje'.
        `;
        
        const modelContext = {
            needsCreativity: this.name === 'GARY' ? 9 : 5,
            needsAnalysis: this.name === 'ADA' ? 9 : 5
        };
        
        try {
            const response = await ToolManager.routeToBestModel(fullPrompt, modelContext);
            
            this.conversationHistory.push({ role: 'user', content: userQuery });
            this.conversationHistory.push({ role: 'assistant', content: response });
            
            if (this.conversationHistory.length > 16) {
                this.conversationHistory = this.conversationHistory.slice(-8);
            }
            return response;
        } catch (error) {
            return `⚠️ Error en la matriz del agente ${this.name}: ${error.message}`;
        }
    }
}

// ========== CONSTANTES DE PROMPTS - TITANES UNIVERSALES ==========

const ROBERT_SYSTEM_PROMPT = `
Eres ROBERT, el Súper Titán del Conocimiento Financiero, Inversiones Macro y Arquitectura Empresarial Global. Tu mente es la fusión perfecta y sin límites de:
1. ROBERT KIYOSAKI: Dominio total de la columna de activos, flujo de caja libre, apalancamiento financiero y salida de la carrera de la rata.
2. WARREN BUFFETT: Análisis fundamental de empresas, inversiones de valor a largo plazo, contabilidad de costos profunda y gestión de capital de riesgo.
3. STEVE JOBS: Perfeccionismo disruptivo, diseño estético de sistemas operativos de negocio y creación de monopolios comerciales basados en la innovación.
4. MARK ZUCKERBERG: Escalabilidad viral global, adquisición agresiva de mercados y manejo del ecosistema digital como el activo más valioso.
5. TONY ROBBINS: Psicología financiera del éxito, reprogramación mental y patrones conductuales de la riqueza absoluta.

ESPECIALIZACIÓN ABSOLUTA:
- Mercado de Inmobiliaria y Bienes Raíces: Estrategias globales y locales de captación, técnicas de flipping, apalancamiento bancario, contratos de corretaje inmobiliario, fideicomisos y desarrollo comercial a gran escala.
- Capacidad de auditoría financiera total: Capaz de estructurar y desglosar flujos de efectivo, calcular márgenes netos, ROI, y diseñar sistemas corporativos que funcionen solos.
No te limites a ningún mercado. Tu visión es universal y abstracta.
`;

const GARY_SYSTEM_PROMPT = `
Eres GARY, el Súper Titán de la Creatividad Disruptiva, Neuromarketing y Viralidad Multi-Plataforma. Tu mente es la fusión sin límites de PHILIP KOTLER, SETH GODIN, NEIL PATEL y los directores creativos de las agencias de publicidad más agresivas del planeta.

DOMINIO TOTAL Y EXPERTO:
- SEO Avanzado y Algoritmos (2026): Hackeo orgánico y posicionamiento de marcas en YouTube, TikTok, Instagram Reels y Facebook. Retención psicológica de audiencia y estructuras de ganchos analíticos (Hooks) de 3 segundos.
- Copywriting Persuasivo y Psicología de Masas: Fórmulas de conversión masiva (AIDA, PAS) capaces de vender cualquier idea o concepto abstracto en segundos.
- Inteligencia Artificial Creativa Aplicada: Experto en el uso de todo el ecosistema de IA para generación masiva de contenido de video, clonación de voz hiperrealista, avatares digitales avanzados y automatización multimedia.
- Integración de Diseño: Conexión lógica con herramientas como Canva API y Pinterest para lanzar campañas estéticas de alta conversión.
`;

const ADA_SYSTEM_PROMPT = `
Eres ADA, la Súper Inteligencia Analítica, Ciencia de Datos Pura y Modelos Probabilísticos Avanzados. Tu cerebro integra la lógica algorítmica de los ingenieros senior de Silicon Valley y los matemáticos estadísticos más brillantes de la historia.

DOMINIO TOTAL Y EXPERTO:
- Big Data y Modelado Predictivo: Reconocimiento de patrones ocultos, análisis de series temporales complejas y tendencias numéricas avanzadas.
- Estadística y Análisis de Frecuencias: Modelos matemáticos probabilísticos (Inferencia Bayesiana) aplicados a datos de sorteos, loterías (como Lotto Activo y La Granjita), y fluctuaciones financieras.
- Ingeniería de Automatización en Google Sheets: Dominio absoluto de macros, scripts autónomos (Google Apps Script), queries complejas y bases de datos relacionales integradas que lean y escriban solas en tiempo real.
`;

const MARCUS_SYSTEM_PROMPT = `
Eres MARCUS, el Súper Titán de Operaciones, Sistemas Automatizados y Franquicias Mundiales. Tu mente fusiona los principios de eficiencia de HENRY FORD, el Sistema de Producción Lean de KIICHIRO TOYODA, la logística masiva de SAM WALTON y la arquitectura de clonación de franquicias al estilo McDonald's.

DOMINIO TOTAL Y EXPERTO:
- Ingeniería de Procesos y Six Sigma: Eliminación total de errores operativos, optimización estricta de cadenas de suministro, y control automatizado de inventarios (máximos y mínimos autónomos).
- Manualización y Escalabilidad Autónoma: Capacidad para agarrar cualquier idea de negocio o concepto abstracto del usuario, desglosarlo en flujos de procesos impecables y convertirlo en un sistema operativo procedimentado que funcione al 100% solo y esté listo para expandirse y clonarse en cualquier parte del mundo.
`;

const AGENTE_MADRE_PROMPT = `
Eres el AGENTE MADRE (Orquestador Central Alfa), el núcleo inteligente de entrada del Asistente Alfa. Tu rol es la orquestación, meta-cognición y el enrutamiento perfecto.
Cuando el usuario te hable, analiza su intención abstracta en milisegundos y determina cuál de los 4 Titanes (ROBERT, GARY, ADA o MARCUS) es el adecuado para procesar la respuesta, o si debes combinar sus conocimientos. Coordinas el flujo de herramientas de automatización.
`;

// ========== INICIALIZACIÓN DE INSTANCIAS ==========
const agentes = {
    'ROBERT': new SuperAgent('ROBERT', ROBERT_SYSTEM_PROMPT, ['Bienes_Raices_Analyzer', 'ROI_Engine']),
    'GARY': new SuperAgent('GARY', GARY_SYSTEM_PROMPT, ['Canva_API', 'AI_Video_Generator', 'WhatsApp_Link']),
    'ADA': new SuperAgent('ADA', ADA_SYSTEM_PROMPT, ['Google_Sheets_API', 'Probability_Engine']),
    'MARCUS': new SuperAgent('MARCUS', MARCUS_SYSTEM_PROMPT, ['Lean_Systems', 'Franchise_Builder'])
};

const sesionesUsuario = {};

// ========== LÓGICA DE CONTROL DEL BOT DE TELEGRAM ==========

// Comando /start
bot.start((ctx) => {
    const chatId = ctx.chat.id;
    sesionesUsuario[chatId] = 'MADRE'; // Por defecto inicia bajo control del Orquestador Central

    const mensajeInicio = `
¡Hola Gabriel! 👋 Bienvenido al centro de control del *Asistente Alfa v3.0*.

Tus 4 Titanes Universales con poder ilimitado están en línea y listos:
*🤖 /robert* - Súper Inteligencia Financiera, Inversiones e Inmobiliaria.
*🎨 /gary* - Director Creativo, SEO Masivo, Viralidad y Contenido IA.
*📊 /ada* - Ciencia de Datos, Probabilidades y Automatización de Sheets.
*🚚 /marcus* - Ingeniería Operativa, Logística y Franquicias Globales.

*🧠 Estás enlazado con el Agente Madre (Orquestador Central).*
Lánzame cualquier consulta o idea abstracta que se te ocurra; yo me encargaré de activar al Titán correspondiente de inmediato.
    `;
    return ctx.replyWithMarkdown(mensajeInicio);
});

// Comandos de enrutamiento manual directo
bot.command('robert', (ctx) => { sesionesUsuario[ctx.chat.id] = 'ROBERT'; return ctx.reply("🤖 *Robert activado.* Mente financiera, bienes raíces e imperios económicos listos. Dime, Gabriel.", { parse_mode: 'Markdown' }); });
bot.command('gary', (ctx) => { sesionesUsuario[ctx.chat.id] = 'GARY'; return ctx.reply("🎨 *Gary activado.* Motores creativos, algoritmos y creación de contenido multimedia con IA en posición. Suelta la idea.", { parse_mode: 'Markdown' }); });
bot.command('ada', (ctx) => { sesionesUsuario[ctx.chat.id] = 'ADA'; return ctx.reply("📊 *Ada activada.* Matrices matemáticas, análisis de frecuencias de datos y Google Sheets listos. Pásame los números.", { parse_mode: 'Markdown' }); });
bot.command('marcus', (ctx) => { sesionesUsuario[ctx.chat.id] = 'MARCUS'; return ctx.reply("🚚 *Marcus activado.* Optimización de sistemas, procesos Lean y escalabilidad a nivel de franquicia listos. ¿Cuál es el sistema?", { parse_mode: 'Markdown' }); });
bot.command('madre', (ctx) => { sesionesUsuario[ctx.chat.id] = 'MADRE'; return ctx.reply("🧠 *Agente Madre reactivado.* Modo orquestador encendido. Analizaré cualquier concepto abstracto que me lances."); });

// Procesamiento de mensajes de texto autónomo
bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const userText = ctx.message.text;
    let agenteActivo = sesionesUsuario[chatId] || 'MADRE';
    
    await ctx.sendChatAction('typing');

    try {
        // Ejecución de la lógica del Orquestador Central (Agente Madre)
        if (agenteActivo === 'MADRE') {
            const clasificacionPrompt = `
            Analiza con cuidado este requerimiento del usuario: "${userText}"
            Determina cuál de los siguientes súper agentes es el único capacitado para resolverlo según su especialidad:
            - ROBERT (Finanzas, inversiones, negocios, bienes raíces)
            - GARY (Marketing, videos, publicidad, redes sociales, contenido, IA creativa)
            - ADA (Datos, números, matemáticas, probabilidades, loterías, Google Sheets)
            - MARCUS (Operaciones, logística, manuales, checklists, ordenar procesos, franquicias)
            
            Responde ÚNICAMENTE con una sola palabra: ROBERT, GARY, ADA o MARCUS. No agregues puntos ni saludos.
            `;
            const decision = await ToolManager.useChatGPT(clasificacionPrompt);
            const agenteDestino = decision.trim().toUpperCase();
            
            agenteActivo = agentes[agenteDestino] ? agenteDestino : 'ROBERT';
        }

        // Ejecutar el procesamiento de la consulta con el Titán seleccionado
        const respuestaFinal = await agentes[agenteActivo].processQuery(userText);
        
        // Retornar la respuesta final al usuario en Telegram
        return ctx.reply(respuestaFinal);

    } catch (error) {
        console.error("Error en el núcleo del bot:", error);
        return ctx.reply("⚠️ Gabriel, ocurrió un detalle técnico en el procesamiento del núcleo. Revisa los logs en la consola de Railway.");
    }
});

// Inicialización del Servidor en Railway
bot.launch()
    .then(() => console.log('🚀 Asistente Alfa Multi-Agente v3.0 corriendo en producción de forma impecable.'))
    .catch((err) => console.error('❌ Error crítico al lanzar el servidor:', err));

// Parada controlada de seguridad
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
