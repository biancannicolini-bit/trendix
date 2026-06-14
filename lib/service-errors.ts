export async function parseServiceError(res: Response): Promise<string> {
  const text = await res.text();

  try {
    const body = JSON.parse(text) as {
      detail?: string | Array<{ msg?: string; type?: string }>;
      error?: string;
      message?: string;
    };

    if (typeof body.detail === "string" && body.detail.trim()) {
      return body.detail;
    }

    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail
        .map((item) => item.msg ?? JSON.stringify(item))
        .join("; ");
    }

    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
  } catch {
    if (text.trim()) {
      return text.slice(0, 500);
    }
  }

  return `Servicio Python respondió ${res.status}`;
}

export function parseFetchError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "La generación tardó demasiado (más de 2 minutos).";
    }
    if (
      error.message.includes("fetch failed") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND")
    ) {
      return "No pudimos conectar con el servicio Python. Verificá que trendix_python esté activo en el servidor.";
    }
    return error.message;
  }
  return "Error desconocido al generar contenido.";
}

/** Mensaje legible para la UI (sin JSON crudo de APIs). */
export function humanizeGenerationError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes("credit balance") || lower.includes("insufficient")) {
    return "Sin créditos en Anthropic. Cargá saldo en console.anthropic.com → Plans & Billing y volvé a intentar.";
  }

  if (lower.includes("authentication") || lower.includes("api key")) {
    return "API key de Anthropic inválida. Revisá ANTHROPIC_API_KEY en trendix_python.";
  }

  if (lower.includes("model") && lower.includes("not found")) {
    return "El modelo de IA configurado no está disponible. Revisá ANTHROPIC_MODEL en trendix_python.";
  }

  const anthropicMsg = raw.match(/'message': '([^']+)'/);
  if (anthropicMsg?.[1]) {
    return anthropicMsg[1];
  }

  if (raw.length > 280) {
    return `${raw.slice(0, 280)}…`;
  }

  return raw;
}
