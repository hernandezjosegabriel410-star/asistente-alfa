const TelegramBot = require('node-telegram-bot-api');

// Se cargan los tokens desde las variables de entorno de Railway
const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error("ERROR: Falta la variable TELEGRAM_TOKEN en Railway.");
  process.exit(1);
}

// Configuración del bot para Railway
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 El Asistente Alfa está encendido y escuchando órdenes...");

// 1. Comando de Bienvenida (/start)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const nombre = msg.from.first_name || "Líder";
  
  const saludo = `¡Saludos, ${nombre}! Bienvenido al centro de control del **Asistente Alfa** 🚀.\n\n` +
                 `Aquí tienes a tu equipo de agentes especializados listos para recibir órdenes. ` +
                 `Trabajamos en conjunto para hacer crecer tus proyectos.\n\n` +
                 `Toca el comando /menu para desplegar los departamentos y asignar tareas.`;
                 
  bot.sendMessage(chatId, saludo, { parse_mode: 'Markdown' });
});

// 2. Menú Principal Interactivo (/menu)
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  
  const opciones = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📈 Dpto. Finanzas (Kiyosaki)', callback_data: 'agente_finanzas' },
          { text: '🍦 Dpto. Operaciones G&M', callback_data: 'agente_operaciones' }
        ],
        [
          { text: '📢 Dpto. Marketing y Diseño', callback_data: 'agente_marketing' },
          { text: '📊 Dpto. Datos y Loterías', callback_data: 'agente_datos' }
        ]
      ]
    },
    parse_mode: 'Markdown'
  };

  bot.sendMessage(chatId, "🗂️ **Selecciona el Departamento con el que deseas trabajar:**", opciones);
});

// 3. Manejo de las respuestas de los botones (Flujo de Trabajo del Equipo)
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  let respuestaEspecialista = "";

  if (data === 'agente_finanzas') {
    respuestaEspecialista = `📈 **[Dpto. Finanzas - Agente Kiyosaki]**\n` +
                           `*Orden recibida, Gabriel.*\n\n` +
                           `Mi enfoque exclusivo es la mente millonaria, el flujo de caja y la multiplicación del dinero. ` +
                           `Escríbeme tu duda sobre costos, inversiones o la diferencia entre activos y pasivos. ` +
                           `¡Vamos a construir riqueza!`;
  } 
  else if (data === 'agente_operaciones') {
    respuestaEspecialista = `🍦 **[Dpto. Operaciones - Gerente G&M]**\n` +
                           `*Orden recibida, Gabriel.*\n\n` +
                           `Estoy listo para gestionar la logística y producción. Envíame los datos para calcular ` +
                           `los costos de la receta de 20L de helados/chicha, la estructura de Agua Divina o las rutas de LavaFácil Express. ` +
                           `¡Mantengamos el negocio eficiente!`;
  } 
  else if (data === 'agente_marketing') {
    respuestaEspecialista = `📢 **[Dpto. Marketing - Diseñador Creativo]**\n` +
                           `*Orden recibida, Gabriel.*\n\n` +
                           `¡La publicidad es el motor de las ventas! Dime qué idea tienes en mente y te armo un jingle, ` +
                           `una campaña para el TikTok de María o copys llamativos para atraer clientes en Valencia.`;
  } 
  else if (data === 'agente_datos') {
    respuestaEspecialista = `📊 **[Dpto. Analítica - Matemático Estadístico]**\n` +
                           `*Orden recibida, Gabriel.*\n\n` +
                           `Listo para los números fríos. Pásame los resultados y horas que estás registrando en tu tabla de Google Sheets ` +
                           `para Lotto Activo o La Granjita. Analizaré las frecuencias para ayudarte con tus tripletas.`;
  }

  // Responder en Telegram y quitar el reloj de carga del botón
  bot.answerCallbackQuery(callbackQuery.id);
  bot.sendMessage(chatId, respuestaEspecialista, { parse_mode: 'Markdown' });
});

// 4. Comando de Ayuda (/ayuda)
bot.onText(/\/ayuda/, (msg) => {
  const chatId = msg.chat.id;
  const textoAyuda = `❓ **Manual de Órdenes del Asistente Alfa:**\n\n` +
                     `• /start - Enciende el bot y da la bienvenida.\n` +
                     `• /menu - Despliega los botones de los 4 agentes especializados.\n\n` +
                     `Cada agente trabaja de forma independiente. Invocas a uno desde el menú, le das su orden, ` +
                     `él se enfoca solo en su tarea y te presenta el resultado limpio.`;
                     
  bot.sendMessage(chatId, textoAyuda, { parse_mode: 'Markdown' });
});
