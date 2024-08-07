import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const Gemini = (() => {
  let modelInstance;
  const defaultSafetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const setModelInstance = async (
    apiKey,
    model = 'gemini-1.5-flash',
    safetySettings = defaultSafetySettings
  ) => {
    const genAI = new GoogleGenerativeAI(apiKey);

    modelInstance = genAI.getGenerativeModel({
      model,
      safetySettings,
    });
  };

  const generateContent = async (prompt) => {
    const { response } = await modelInstance.generateContent(prompt);
    return response.text();
  };

  return {
    setModelInstance,
    generateContent,
  };
})();

export default Gemini;
