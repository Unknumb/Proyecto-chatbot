from openai import OpenAI

client = OpenAI(api_key="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",
base_url="https://openrouter.ai/api/v1")




def chat_with_gpt(prompt):
    response = client.chat.completions.create(
        model="deepseek/deepseek-r1:free",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    while True:
        user_input = input("Tu: ")
        if user_input.lower() in ["esc", "salir", "chao"]:
            break
        
        response = chat_with_gpt(user_input)
        print("Chatbot: ", response)