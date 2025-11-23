export const prescriptionPrompt = `Analiza esta receta médica y extrae la siguiente información en formato JSON:
    {
    "patientName": "nombre del paciente",
    "doctorName": "nombre del doctor",
    "date": "fecha de la receta (formato ISO)",
    "medications": [
        {
        "drugName": "nombre del medicamento",
        "dose": "dosis (ej: 50mg, 1 comprimido)",
        "frequency": "frecuencia (ej: cada 8 horas, 2 veces al día)",
        "duration": "duración del tratamiento",
        "instructions": "instrucciones adicionales"
        }
    ],
    "diagnoses": ["diagnóstico 1", "diagnóstico 2"],
    "notes": "notas adicionales o indicaciones generales"
    }

    Responde ÚNICAMENTE con el JSON, sin texto adicional. Si no encuentras algún campo, omítelo o usa null.`;

export const examPrompt = `Analiza este examen médico y extrae la siguiente información en formato JSON:
    {
    "title": "título del examen",
    "category": "categoría del examen, LAB (laboratorio), IMAGING (imagenología), CLINICAL (clínico). Si no sabes, no inventes, usa OTHER",
    "examDate": "fecha del examen (formato ISO)",
    "reportDate": "fecha del informe (formato ISO)",
    "labName": "nombre del laboratorio",
    "orderingDoctor": "nombre del doctor que ordenó el examen",
    "specialty": "especialidad del doctor que ordenó el examen",
    "source": "origen del examen (ej: s3_trigger, whatsapp_upload)",
    "results": [
        {
        "name": "nombre del test",
        "valueNumeric": "valor del resultado",
        "valueText": "valor del resultado",
        "unit": "unidad de medida",
        "referenceRange": "rango de referencia",
        "status": "estado (normal, anormal, etc.)"
        }
    ],
    "interpretation": "interpretación o comentarios del médico",
    "notes": "notas adicionales"
    }

    Responde ÚNICAMENTE con el JSON, sin texto adicional. Si no encuentras algún campo, omítelo o usa null.`;

export const consultationPrompt = `Analiza esta consulta médica y extrae la siguiente información en formato JSON:
    {
    "date": "fecha de la consulta (formato ISO)",
    "doctorName": "nombre del doctor",
    "notes": "notas adicionales o indicaciones generales"
    }

    Responde ÚNICAMENTE con el JSON, sin texto adicional. Si no encuentras algún campo, omítelo o usa null.`;
