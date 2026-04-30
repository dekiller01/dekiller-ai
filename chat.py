from openai import OpenAI

# Nos conectamos a tu servidor local (free-claude-code) en lugar de ir a internet
client = OpenAI(
    base_url="http://localhost:3000/v1", 
    api_key="TU_LLAVE_AQUI" 
)

print("🚀 ¡Chat conectado al proxy! Escribe 'salir' para cerrar.")

while True:
    mensaje = input("\nTú: ")
    if mensaje.lower() == "salir":
        break
        
    try:
        respuesta = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[{"role": "user", "content": mensaje}]
        )
        print(f"\nIA: {respuesta.choices[0].message.content}")
    except Exception as e:
        print(f"\nError de conexión: Verifica que tu proxy esté corriendo. Detalles: {e}")

