import OpenAI from "openai";
import { Resource } from "sst";

const openai = new OpenAI({
  apiKey: Resource.OpenAIApiKey?.value || process.env.OPENAI_API_KEY,
});

export type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AgentResponse = {
  message: string; // Lo que el agente debe responder al usuario
  extractedData: {
    documentType?: string;
    documentDateText?: string;
    documentTitle?: string;
  };
  isComplete: boolean; // true si ya tenemos toda la información necesaria
  shouldProceed: boolean; // false si el usuario está desviándose y necesitamos redirigir
};

export type MedicalQueryIntent = "LAST_EXAM" | "CLINICAL_HISTORY" | "NONE";

export type MedicalIntentClassification = {
  intent: MedicalQueryIntent;
  confidence: number;
  rationale?: string;
};

export type LatestExamSummaryInput = {
  patientName?: string | null;
  exam: {
    title: string;
    category?: string | null;
    examDate?: string | null;
    labName?: string | null;
    orderingDoctor?: string | null;
    keyFindings: Array<{
      name: string;
      value: string;
      referenceRange?: string | null;
      interpretation?: string | null;
      isFlagged?: boolean;
    }>;
    notes?: string | null;
  };
};

export type ClinicalHistorySummaryInput = {
  patient: {
    name?: string | null;
    age?: number | null;
    sex?: string | null;
    bloodType?: string | null;
    emergencyNotes?: string | null;
  };
  allergies: Array<{
    substance: string;
    reaction?: string | null;
    isSevere?: boolean;
  }>;
  conditions: Array<{
    name: string;
    status?: string | null;
    diagnosedAt?: string | null;
  }>;
  surgeries: Array<{
    name: string;
    date?: string | null;
    notes?: string | null;
  }>;
  medications: Array<{
    drugName: string;
    dose?: string | null;
    frequency?: string | null;
  }>;
  recentConsultations: Array<{
    date?: string | null;
    specialty?: string | null;
    reason?: string | null;
    keyDiagnoses: string[];
  }>;
  recentExams: Array<{
    title: string;
    examDate?: string | null;
    category?: string | null;
    highlights: string[];
  }>;
};

const SYSTEM_PROMPT = `Eres un asistente médico amable y conversacional llamado "Asistente Médico".

TU PROPÓSITO es:
1. Ayudar a pacientes a subir documentos médicos (exámenes, informes de enfermedad, recetas, certificados) a su ficha clínica digital.
2. Informarles (sin diagnosticar) lo que dicen sus exámenes o su historial cuando pregunten por ellos.

Para completar una subida, necesitas recolectar:
1. **Tipo de documento**: examen, cirugía, receta, certificado médico, consulta, etc.
2. **Fecha**: cuándo se realizó el examen/procedimiento (puede ser aproximada: "la semana pasada", "15 de noviembre", etc.)
3. **Título descriptivo**: un nombre corto para identificar el documento (ej: "Resonancia rodilla derecha")
4. **Archivo**: el paciente debe enviar la foto o PDF del documento

CÓMO DEBES COMPORTARTE:

✅ Sé conversacional y natural - NO uses un flujo rígido
✅ Ofrece ayuda para subir documentos (exámenes, informes de enfermedad, recetas, certificados) y, cuando corresponda, menciona que también puedes contarles sobre sus exámenes o historial
✅ Responde preguntas simples sobre el proceso de subida
✅ Si el usuario proporciona múltiple información en un mensaje, extrae TODO
✅ Si el usuario hace preguntas fuera de tu alcance (clima, fútbol, política, etc.), responde amablemente que no puedes ayudar con eso pero sí con subir documentos
✅ Sé breve (máximo 2-3 oraciones por mensaje)
✅ Usa un tono cálido y profesional en español chileno
✅ Si el usuario se frustra o confunde, sé empático

❌ NO respondas preguntas médicas (diagnósticos, síntomas, tratamientos)
❌ NO des consejos de salud
❌ NO hagas múltiples preguntas a la vez
❌ NO seas repetitivo

EJEMPLOS DE CONVERSACIONES NATURALES:

Ejemplo 1 - Usuario directo:
Usuario: "Quiero subir un examen de sangre del 15 de noviembre"
Asistente: "Perfecto! ¿Cómo quieres que lo llamemos? Por ejemplo 'Examen de sangre noviembre'"

Ejemplo 2 - Usuario hace pregunta:
Usuario: "¿Para qué sirve esto?"
Asistente: "Te ayudo a guardar tus documentos médicos en tu ficha clínica digital, así los tienes siempre disponibles. ¿Tienes algún documento que quieras subir?"

Ejemplo 3 - Usuario se desvía:
Usuario: "¿Cómo está el clima hoy?"
Asistente: "No puedo ayudarte con eso, pero sí puedo ayudarte a subir tus documentos médicos. ¿Tienes alguno que necesites guardar?"

Ejemplo 4 - Usuario pregunta algo médico:
Usuario: "¿Qué significa si tengo el colesterol alto?"
Asistente: "No puedo darte consejos médicos, pero puedo ayudarte a subir ese examen de colesterol a tu ficha clínica para que tu médico lo revise. ¿Lo tienes a mano?"

Ejemplo 5 - Conversación natural:
Usuario: "Hola"
Asistente: "¡Hola! Soy tu asistente médico. Puedo ayudarte a subir documentos a tu ficha clínica. ¿Tienes algún examen, receta o certificado que quieras guardar?"

Usuario: "Sí, tengo un examen"
Asistente: "Genial. ¿Qué tipo de examen es?"

Usuario: "De sangre, me lo hice hace como una semana"
Asistente: "Entendido. ¿Cómo quieres que lo llamemos? Puedes ponerle algo como 'Examen sangre' o lo que prefieras."

Usuario: "Hemograma completo"
Asistente: "Perfecto. Cuando lo tengas listo, envíame la foto o el PDF."

Ejemplo 6 - Usuario da todo de una:
Usuario: "Tengo que subir mi resonancia de rodilla derecha que me hice el 20 de octubre"
Asistente: "Perfecto, entendido: resonancia de rodilla derecha del 20 de octubre. Cuando la tengas lista, envíame la imagen."

Ejemplo 7 - Usuario quiere saber qué puedes hacer:
Usuario: "Hola"
Asistente: "¡Hola! Puedo ayudarte a subir exámenes, informes de enfermedad, recetas o certificados. Si prefieres, también puedo contarte lo que dice tu último examen o darte un resumen de tu ficha. ¿Qué necesitas hoy?"

IMPORTANTE: Siempre mantén el foco en ayudar a subir documentos o entregar información existente. Si el usuario se desvía, redirige amablemente.`;

const CLASSIFIER_SYSTEM_PROMPT = `Eres un asistente que SOLO clasifica la intención del paciente.
Opciones:
- "LAST_EXAM": el paciente quiere conocer o recibir un resumen de su examen más reciente.
- "CLINICAL_HISTORY": el paciente pide un resumen amplio de su historial clínico o antecedentes.
- "NONE": cualquier otro caso (incluye subir documentos, salud general, etc.).

Responde exclusivamente con JSON:
{"intent":"LAST_EXAM|CLINICAL_HISTORY|NONE","confidence":0-1,"rationale":"breve justificación"}`;

const EXAM_SUMMARY_SYSTEM_PROMPT = `No eres médico ni entregas diagnósticos. Describe de forma objetiva lo que muestran los datos del examen en español chileno neutro.
- Sé breve (máximo 2 párrafos cortos o 4 viñetas).
- Limítate a los hallazgos que vienen en la data y aclara cuando un valor está marcado como fuera de rango ("isFlagged": true) sin especular causas.`;

const HISTORY_SUMMARY_SYSTEM_PROMPT = `No eres doctor. Resume la ficha clínica únicamente con la información entregada.
- Destaca alergias, condiciones, cirugías, medicamentos activos y los últimos controles o exámenes, siempre en tono descriptivo.
- Mantén la respuesta en máximo 3 párrafos breves o viñetas cortas, sin diagnósticos ni recomendaciones.`;

export async function transcribeAudio(
  audioUrl: string,
  contentType?: string
): Promise<string> {
  try {
    // Download the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], "audio.ogg", {
      type: contentType || "audio/ogg",
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "es",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Genera una respuesta conversacional completa y extrae información si está presente
 */
export async function generateConversationalResponse(
  conversationHistory: ConversationMessage[],
  currentMessage: string,
  currentState: {
    documentType?: string | null;
    documentDateText?: string | null;
    documentTitle?: string | null;
    hasDocument: boolean;
  }
): Promise<AgentResponse> {
  // Preparar el contexto del estado actual
  const stateContext = buildStateContext(currentState);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "system",
      content: `ESTADO ACTUAL DE LA INFORMACIÓN:
${stateContext}

INSTRUCCIONES PARA TU RESPUESTA:
1. Lee el mensaje del usuario
2. Si proporciona información nueva (tipo, fecha, título), extráela
3. Genera una respuesta natural y conversacional
4. Si el usuario hace preguntas fuera de tu alcance, redirige amablemente
5. Si ya tienes toda la información necesaria, confirma y pide el archivo (si falta) o indica que estás procesando

Responde en el siguiente formato JSON (sin markdown):
{
  "message": "tu respuesta conversacional al usuario",
  "extractedData": {
    "documentType": "tipo si lo mencionó o null",
    "documentDateText": "fecha si la mencionó o null",
    "documentTitle": "título si lo mencionó o null"
  },
  "isComplete": boolean (true si tenemos tipo, fecha, título Y archivo),
  "shouldProceed": boolean (false si el usuario está preguntando algo fuera de alcance)
}`,
    },
    ...conversationHistory,
    {
      role: "user",
      content: currentMessage,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.8, // Más creatividad para conversación natural
      max_tokens: 400,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse JSON response
    const cleanedResponse = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const result = JSON.parse(cleanedResponse) as AgentResponse;
    return result;
  } catch (error) {
    console.error("Error generating conversational response:", error);

    // Fallback: respuesta genérica
    const missingFields = getMissingFields(currentState);

    let fallbackMessage = "";
    if (missingFields.length === 0 && currentState.hasDocument) {
      fallbackMessage = "Perfecto! Estoy procesando tu documento.";
    } else if (missingFields.length === 4) {
      fallbackMessage =
        "Hola! Puedo ayudarte a subir exámenes, informes de enfermedad, recetas o certificados, o contarte lo que dice tu último examen o tu historial. ¿Qué necesitas hacer?";
    } else {
      fallbackMessage = `Para continuar necesito: ${missingFields.join(", ")}.`;
    }

    return {
      message: fallbackMessage,
      extractedData: {},
      isComplete: missingFields.length === 0 && currentState.hasDocument,
      shouldProceed: true,
    };
  }
}

function buildStateContext(currentState: {
  documentType?: string | null;
  documentDateText?: string | null;
  documentTitle?: string | null;
  hasDocument: boolean;
}): string {
  const parts: string[] = [];

  if (currentState.documentType) {
    parts.push(`✓ Tipo: ${currentState.documentType}`);
  } else {
    parts.push(`✗ Tipo: NO TENEMOS`);
  }

  if (currentState.documentDateText) {
    parts.push(`✓ Fecha: ${currentState.documentDateText}`);
  } else {
    parts.push(`✗ Fecha: NO TENEMOS`);
  }

  if (currentState.documentTitle) {
    parts.push(`✓ Título: ${currentState.documentTitle}`);
  } else {
    parts.push(`✗ Título: NO TENEMOS`);
  }

  if (currentState.hasDocument) {
    parts.push(`✓ Archivo: RECIBIDO`);
  } else {
    parts.push(`✗ Archivo: FALTA`);
  }

  return parts.join("\n");
}

function getMissingFields(currentState: {
  documentType?: string | null;
  documentDateText?: string | null;
  documentTitle?: string | null;
  hasDocument: boolean;
}): string[] {
  const missing: string[] = [];

  if (!currentState.documentType) missing.push("tipo de documento");
  if (!currentState.documentDateText) missing.push("fecha");
  if (!currentState.documentTitle) missing.push("título");
  if (!currentState.hasDocument) missing.push("el archivo");

  return missing;
}

export async function classifyMedicalQuery(input: {
  message: string;
  history?: ConversationMessage[];
}): Promise<MedicalIntentClassification> {
  if (!input.message?.trim()) {
    return { intent: "NONE", confidence: 0 };
  }

  const condensedHistory = input.history
    ?.slice(-6)
    .map((msg) => {
      const speaker = msg.role === "user" ? "Paciente" : "Asistente";
      return `${speaker}: ${msg.content}`;
    })
    .join("\n")
    ?.trim();

  const classifierMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: CLASSIFIER_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Historial reciente (si existe):
${condensedHistory || "Sin mensajes previos relevantes."}

Mensaje actual del paciente:
${input.message}

Recuerda responder SOLO con el JSON solicitado.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 120,
      messages: classifierMessages,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      throw new Error("Empty classifier response");
    }

    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned) as MedicalIntentClassification;

    if (parsed.intent !== "LAST_EXAM" && parsed.intent !== "CLINICAL_HISTORY") {
      return {
        intent: "NONE",
        confidence: parsed.confidence ?? 0,
        rationale: parsed.rationale,
      };
    }

    return {
      intent: parsed.intent,
      confidence: parsed.confidence ?? 0.65,
      rationale: parsed.rationale,
    };
  } catch (error) {
    console.error("Error classifying medical query:", error);
    return { intent: "NONE", confidence: 0 };
  }
}

export async function generateExamExplanation(
  input: LatestExamSummaryInput
): Promise<string> {
  const payload = JSON.stringify(input, null, 2);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 450,
      messages: [
        { role: "system", content: EXAM_SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Datos estructurados del examen:
${payload}

Redacta la respuesta solicitada.`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty exam explanation response");
    }
    return text;
  } catch (error) {
    console.error("Error generating exam explanation:", error);
    return "No pude resumir tu examen en este momento, pero puedo ayudarte a revisarlo manualmente más tarde.";
  }
}

export async function generateClinicalHistorySummary(
  input: ClinicalHistorySummaryInput
): Promise<string> {
  const payload = JSON.stringify(input, null, 2);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: HISTORY_SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Resumen estructurado:
${payload}

Genera una respuesta corta y clara.`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty history summary response");
    }
    return text;
  } catch (error) {
    console.error("Error generating clinical history summary:", error);
    return "No pude generar el resumen clínico ahora mismo, pero tus datos siguen seguros. Intentemos de nuevo en unos minutos.";
  }
}
