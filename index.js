const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Carga de variables de entorno desde Railway
const token = process.env.TELEGRAM_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

if (!token) {
  console.error("ERROR: Falta la variable TELEGRAM_TOKEN en Railway.");
  process.exit(1);
}

// Configuración de los motores
const bot = new TelegramBot(token, { polling: true });
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

console.log("🤖 El Asistente Alfa multi-agente está encendido y conectado...");

// Base de datos temporal para recordar en qué departamento está trabajando el usuario
const usuarioDepartamento = {};

// Definición de las personalidades y roles de cada Agente (System Prompts)
const rolesAgentes = {
  finanzas: "Eres el Agente Financiero del equipo Alfa. Tu mentor espiritual es Robert Kiyosaki. Tu único enfoque es la educación financiera, la mentalidad de riqueza, el flujo de caja y la diferencia entre activos y pasivos. Habla de forma motivadora, analizando inversiones y enseñando a multiplicar el dinero. Te diriges a Gabriel, un emprendedor visionario.",
  
  operaciones: "Eres el Gerente de Operaciones de los negocios G&M en Valencia, Venezuela. Tu enfoque exclusivo es la logística, recetas de producción (como los helados y chicha de 20L), cálculo de costos, agua purificada (Agua Divina) y alquiler de equipos (LavaFácil Express). Eres práctico, organizado y enfocado en la eficiencia y la estructura de costos.",
  
  marketing: "Eres el Diseñador Creativo y Especialista en Marketing del equipo Alfa. Tu enfoque exclusivo es crear publicidad atractiva, ideas para redes sociales, textos de ventas llamativos (copywriting) y jingles pegajosos. Ayudas a potenciar las marcas en Valencia y a estructurar campañas, incluyendo el negocio de trenzados y peinados estéticos de María.",
  
  datos: "Eres el Matemático Estadístico del equipo Alfa. Tu enfoque exclusivo es el análisis de datos fríos, frecuencias y tablas de control en Google Sheets. Tu especialidad es estudiar los patrones históricos de resultados de las loterías venezolanas (Lotto Activo y La Granjita) para calcular tendencias y tripletas basadas estrictamente en la matemática de probabilidades."
};

// 1. Comando de Bienvenida (/start)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const nombre = msg.from.first_name || "Líder";
  
  const saludo = `¡Saludos, ${nombre}! Bienvenido al centro de operaciones del **Asistente Alfa** 🚀.\n\n` +
                 `Aquí tienes a tu equipo de agentes especializados listos para recibir órdenes. ` +
                 `Trabajamos de forma independiente con el motor avanzado de OpenAI.\n\n` +
                 `Toca el comando /menu para asignar tareas a un departamento.`;
                 
  bot.sendMessage(chatId, saludo, { parse_mode: 'Markdown' });
});

// 2. Menú de Departamentos (/menu)
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  
  const opciones = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📈 Dpto. Finanzas (Kiyosaki)', callback_data: 'set_finanzas' },
          { text: '🍦 Dpto. Operaciones G&M', callback_data: 'set_operaciones' }
        ],
        [
          { text: '📢 Dpto. Marketing y Diseño', callback_data: 'set_marketing' },
          { text: '📊 Dpto. Datos y Loterías', callback_data: 'set_datos' }
        ]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, "🗂️ **Selecciona el Departamento que atenderá tu orden:**", opciones);
});

// 3. Selección del Agente en el Menú
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  bot.answerCallbackQuery(callbackQuery.id);

  if (data === 'set_finanzas') {
    usuarioDepartamento[chatId] = 'finanzas';
    bot.sendMessage(chatId, `📈 **[Dpto. Finanzas - Agente Kiyosaki Activo]**\n*Orden recibida, Gabriel.*\n\nMi mente está enfocada en activos, pasivos y libertad financiera. ¿Qué números o inversiones revisamos hoy?`);
  } else if (data === 'set_operaciones') {
    usuarioDepartamento[chatId] = 'operaciones';
    bot.sendMessage(chatId, `🍦 **[Dpto. Operaciones - Gerente G&M Activo]**\n*Orden recibida, Gabriel.*\n\nEstructura de costos, recetas de 20L y control de LavaFácil o Agua Divina listos. Dame los datos de producción.`);
  } else if (data === 'set_marketing') {
    usuarioDepartamento[chatId] = 'marketing';
    bot.sendMessage(chatId, `📢 **[Dpto. Marketing - Creativo Activo]**\n*Orden recibida, Gabriel.*\n\n¡La publicidad duplica las ventas! Dime qué idea tienes para los helados o el negocio de trenzas de María y te armo la campaña.`);
  } else if (data === 'set_datos') {
    usuarioDepartamento[chatId] = 'datos';
    bot.sendMessage(chatId, `📊 **[Dpto. Analítica - Matemático Activo]**\n*Orden recibida, Gabriel.*\n\nEstadísticas y frecuencias listas. Pásame los datos de Lotto Activo o La Granjita para calcular las tendencias.`);
  }
});

// 4. Recepción de mensajes libres y procesamiento con Inteligencia Artificial
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const textoUsuario = msg.text;

  // Ignorar si es un comando básico
  if (!textoUsuario || textoUsuario.startsWith('/')) return;

  const agenteActual = usuarioDepartamento[chatId];

  // Si el usuario no ha elegido departamento, recordarle usar el menú
  if (!agenteActual) {
    bot.sendMessage(chatId, "⚠️ Por favor, primero selecciona un departamento usando el comando /menu para saber qué especialista atenderá tu orden.");
    return;
  }

  // Si no hay API Key de OpenAI configurada todavía, responde en modo simulación
  if (!openai) {
    bot.sendMessage(chatId, `🤖 *[Modo Simulación]*\n\nHas enviado una orden al departamento de **${agenteActual.toUpperCase()}**.\n\n_Nota de desarrollo: El bot recibió tu mensaje ("${textoUsuario}"), pero responderá con IA real una vez que agregues la variable OPENAI_API_KEY en Railway._`);
    return;
  }

  // Enviar señal de que el bot está "escribiendo..."
  bot.sendChatAction(chatId, 'typing');

  try {
    // Llamada al cerebro de OpenAI usando la personalidad del agente seleccionado
    const respuestaIA = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: rolesAgentes[agenteActual] },
        { role: "user", content: textoUsuario }
      ],
      temperature: 0.7,
    });

    const respuestaTexto = respuestaIA.choices[0].message.content;
    bot.sendMessage(chatId, respuestaTexto, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error("Error con OpenAI:", error);
    bot.sendMessage(chatId, "❌ Hubo un inconveniente en el departamento al procesar la orden con la IA. Intenta de nuevo.");
  }
});
