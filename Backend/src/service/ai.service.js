const  { GoogleGenAI }  =  require('@google/genai')

const ai = new GoogleGenAI({});

async function generateResponse(payload) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: payload,
  });
  return response.text;
}

module.exports = generateResponse