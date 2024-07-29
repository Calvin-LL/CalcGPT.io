import OpenAI from "openai";
// @ts-expect-error
import { MATH_LENGTH_LIMIT } from "../../src/core/CalcGPT3";

interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const searchParams = new URL(request.url).searchParams;

    console.log(Object.fromEntries(searchParams.entries()));

    const math = searchParams.get("m");
    if (!math) {
      return new Response("invalid query parameter", {
        status: 400,
      });
    }
    if (math.length > MATH_LENGTH_LIMIT) {
      return new Response("math expression too long", {
        status: 400,
      });
    }
    let temperature = parseFloat(searchParams.get("t") ?? "NaN");
    if (isNaN(temperature) || !isFinite(temperature)) {
      return new Response("invalid temperature", {
        status: 400,
      });
    }
    temperature = Math.max(0, Math.min(2, temperature));
    let topP = parseFloat(searchParams.get("p") ?? "NaN");
    if (isNaN(topP) || !isFinite(topP)) {
      return new Response("invalid topP", {
        status: 400,
      });
    }
    topP = Math.max(0, Math.min(1, topP));

    const prompt = `1+1=2\n5-2=3\n2*4=8\n9/3=3\n10/3=3.33333333333\n${math}=`;

    const openAI = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter();

    ctx.waitUntil(
      (async () => {
        const stream = await await openAI.completions.create({
          model: "babbage-002",
          temperature,
          top_p: topP,
          stop: "\n",
          prompt,
          stream: true,
        });

        for await (const part of stream) {
          writer.write(part);
        }
        writer.close();
      })(),
    );

    return new Response(readable);
  },
} satisfies ExportedHandler<Env>;
