import readline from 'readline';
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";


require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export const run = async () => {
  const llm_1 = new OpenAI({ temperature: 1, modelName: "gpt-3.5-turbo-16k" });
  const memory = new BufferMemory();
  const chain = new ConversationChain({ llm: llm_1, memory });
  
  const prompt = new PromptTemplate({
    inputVariables: ["question"],
    template: "{question}がわからないようなので教えて",
  });

  const continueConversation = async () => {
    rl.question('入力: ', async (nextInput) => {
      if (nextInput.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      const response = await chain.call({ input: nextInput });
      console.log(`回答: ${response.response}`);
      continueConversation();
    });
  };

  rl.question('何について質問しますか？ ', async (initialInput) => {
    const initialPrompt = await prompt.format({ question: initialInput });
    const initialResponse = await chain.call({ input: initialPrompt });
    console.log(`回答: ${initialResponse.response}`);
    continueConversation();
  });
};

run();
