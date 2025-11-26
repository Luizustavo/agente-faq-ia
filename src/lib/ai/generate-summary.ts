import { z } from "zod";

const AISummarySchema = z.object({
  title: z
    .string()
    .min(10, "Título muito curto")
    .max(150, "Título muito longo"),
  summary: z
    .string()
    .min(
      500,
      "Resumo muito curto — deve conter exemplos e explicações completas"
    )
    .max(3500),
  discipline: z.string().nullable().optional(),
  lectureNumber: z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? null : num;
    }),
  theme: z.string().nullable().optional(),
});

export async function generateSummary(text: string) {
  const trimmed = text.substring(0, 10000).trim();
  if (trimmed.length < 20) throw new Error("Texto muito curto");

const prompt = `Você é um professor universitário especializado em ensinar tecnologia. Seu aluno usará este material para se preparar para uma prova.

Retorne sua resposta em formato JSON com os seguintes campos: "title", "summary", "discipline", "lectureNumber", "theme".

O campo "summary" DEVE seguir EXATAMENTE o seguinte padrão narrativo (em português do Brasil):

> **INTRODUÇÃO**  
> [Frase de abertura que define o tema central com clareza]. Nesta aula, vamos explorar [principais tópicos], que são fundamentais na disciplina de [disciplina]. [Explicação breve do porquê esses conceitos são importantes]. Além disso, vamos discutir [outro conceito-chave], que [descreva sua função ou relevância]. Vamos explorar esses temas e sua aplicação através de exemplos práticos.

> **Contexto**: [1–2 frases sobre relevância acadêmica e profissional.]

> **Conceitos-chave**: [Liste os conceitos com frases completas, não apenas títulos.]

> **Exemplos práticos**: [Descreva dois exemplos concretos: um teórico (ex: fórmula, pseudocódigo) e um aplicado (ex: caso real).]

> **Aplicação**: [Explique como é usado no mercado ou em projetos reais.]

> **Erro comum**: [Identifique e corrija um equívoco comum dos alunos.]

> **Resumo final**: Em resumo, [reafirme o valor central], destacando que [conceitos] são essenciais para [objetivo]. Entender [ponto crítico] é fundamental para aplicar esses conceitos de forma correta.

Baseie-se EXCLUSIVAMENTE no texto fornecido. Não invente exemplos que não possam ser inferidos do conteúdo. Use termos técnicos corretos (ex: "probabilidade condicional", não "chance de algo acontecer").

**Texto da aula**:
${trimmed}`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
        max_tokens: 2048,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq falhou: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log("AI Response:", content);

  const parsed = JSON.parse(content);
  console.log("Parsed JSON:", parsed);

  // Truncar summary se exceder o limite
  if (parsed.summary && parsed.summary.length > 3500) {
    console.warn(
      `Summary truncado de ${parsed.summary.length} para 3500 caracteres`
    );
    parsed.summary = parsed.summary.substring(0, 3497) + "...";
  }

  return AISummarySchema.parse(parsed);
}
