import readline from 'readline';
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";



require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export const run = async () => {
  const llm_1 = new OpenAI({ temperature: 1, modelName: "gpt-3.5-turbo-16k" });
  const memory = new BufferMemory();
  const chain = new ConversationChain({ llm: llm_1, memory });
  const loader = new TextLoader("./src/document_loaders/example_data/example.txt");
  const docs = await loader.load();
  const doc = new Document({ pageContent: docs[0].pageContent, metadata: { source: "example.txt" } });

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
      // docs（Documentオブジェクト）とnextInputを結合
      const combinedInput = `${nextInput}\n関連情報: ${doc.pageContent}`;
      const response = await chain.call({ input: combinedInput });
      console.log(`回答: ${response.response}`);
      continueConversation();
    });
  };

  rl.question('何について質問しますか？ ', async (initialInput) => {
    const initialPrompt = await prompt.format({ question: initialInput });
    const combinedInitialInput = `${initialPrompt}\n関連情報: ${doc.pageContent}`;
    const initialResponse = await chain.call({ input: combinedInitialInput });
    console.log(`回答: ${initialResponse.response}`);
    continueConversation();
  });
};

run();
