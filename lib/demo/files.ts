export const DEMO_REPOSITORY = "acme/checkout-service";
export const DEMO_MIGRATION_ID = "mig_openai_v4";
export const DEMO_BRANCH = "apisync/openai-sdk-migration";

export type DemoFile = {
  path: string;
  content: string;
  language: "typescript" | "json";
};

export const DEMO_FILES: DemoFile[] = [
  {
    path: "package.json",
    language: "json",
    content: `{
  "name": "checkout-service",
  "private": true,
  "dependencies": {
    "openai": "^3.3.0",
    "stripe": "^14.21.0",
    "twilio": "^4.23.0"
  }
}
`,
  },
  {
    path: "src/lib/openai.ts",
    language: "typescript",
    content: `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function completePrompt(prompt: string) {
  const response = await openai.createCompletion({
    engine: "gpt-3.5-turbo",
    prompt,
    max_tokens: 200,
  });

  return response.data.choices[0]?.text ?? "";
}

export { openai };
`,
  },
  {
    path: "src/services/chat.ts",
    language: "typescript",
    content: `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function chat(messages: Message[]) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  return completion.data.choices[0]?.message?.content ?? "";
}
`,
  },
  {
    path: "src/api/generate.ts",
    language: "typescript",
    content: `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCopy(prompt: string) {
  const response = await openai.createCompletion({
    engine: "gpt-3.5-turbo",
    prompt: "Hello",
    max_tokens: 80,
  });

  return response.data.choices[0]?.text ?? prompt;
}
`,
  },
  {
    path: "src/payments/payment.ts",
    language: "typescript",
    content: `import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
});

export async function charge(amount: number, customer: string) {
  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer,
  });
}
`,
  },
  {
    path: "src/notifications/sms.ts",
    language: "typescript",
    content: `import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export async function sendReceipt(to: string, body: string) {
  return client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body,
  });
}
`,
  },
  {
    path: "src/experiments/unsafe-call.ts",
    language: "typescript",
    content: `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function unsafeComplete(prompt: string) {
  const engine = "gpt-3.5-turbo";
  const response = await openai.createCompletion({
    engine,
    prompt,
  });

  return response.data.choices[0]?.text ?? "";
}
`,
  },
];

export const OPENAPI_OPERATIONS = [
  {
    method: "POST" as const,
    path: "/v1/completions",
    summary: "Create completion",
    status: "removed" as const,
    v1: `openai.createCompletion({
  engine: "gpt-3.5-turbo",
  prompt: "Hello"
})`,
    v2: `openai.completions.create({
  model: "gpt-3.5-turbo",
  prompt: "Hello"
})`,
    note: "The legacy completions helper and the engine field were removed in SDK v4.",
  },
  {
    method: "POST" as const,
    path: "/v1/chat/completions",
    summary: "Create chat completion",
    status: "changed" as const,
    v1: `openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages
})`,
    v2: `openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages
})`,
    note: "Chat completions moved under the chat resource. The response data wrapper was removed.",
  },
  {
    method: "GET" as const,
    path: "/v1/models",
    summary: "List models",
    status: "stable" as const,
    v1: `openai.listModels()`,
    v2: `openai.models.list()`,
    note: "Model listing moved to a resource method. This demo migration does not rewrite it automatically.",
  },
];
