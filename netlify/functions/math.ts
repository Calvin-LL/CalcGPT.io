import { stream } from "@netlify/functions";
import OpenAI from "openai";

// only allow digits, decimal, and math operators
export const mathRegex = /^([+\-*/\d.])+$/;

export const handler = stream(async (event) => {
  const math = event.queryStringParameters?.m;
  if (!math) {
    return {
      statusCode: 400,
      body: "invalid query parameter",
    };
  }
  if (!mathRegex.test(math)) {
    return {
      statusCode: 400,
      body: "invalid math expression",
    };
  }
  const temperature = parseFloat(event.queryStringParameters?.t ?? "NaN");
  if (isNaN(temperature) || !isFinite(temperature)) {
    return {
      statusCode: 400,
      body: "invalid temperature",
    };
  }
  const topP = parseFloat(event.queryStringParameters?.p ?? "NaN");
  if (isNaN(topP) || !isFinite(topP)) {
    return {
      statusCode: 400,
      body: "invalid topP",
    };
  }

  const prompt = `1+1=2\n5-2=3\n2*4=8\n9/3=3\n10/3=3.33333333333\n${math}=`;
  let stream: Awaited<ReturnType<OpenAI["completions"]["create"]>>;

  try {
    const openAI = new OpenAI();
    stream = await openAI.completions.create({
      model: "curie",
      temperature,
      top_p: topP,
      stop: "\n",
      prompt,
      stream: true,
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: "api error",
    };
  }

  return {
    headers: {
      "content-type": "text/event-stream",
    },
    statusCode: 200,
    body: stream,
  };
});
