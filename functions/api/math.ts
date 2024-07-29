import OpenAI from "openai";
import { MATH_LENGTH_LIMIT } from "../../src/core/CalcGPT3";

interface Env {
  OPENAI_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const searchParams = new URL(context.request.url).searchParams;

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
  let response: Response;

  try {
    const openAI = new OpenAI({
      apiKey: context.env.OPENAI_API_KEY,
    });
    response = await openAI.completions
      .create({
        model: "babbage-002",
        temperature,
        top_p: topP,
        stop: "\n",
        prompt,
        stream: true,
      })
      .asResponse();
  } catch (error) {
    console.error(error);
    return new Response("api error", {
      status: 500,
    });
  }

  return response;
};
