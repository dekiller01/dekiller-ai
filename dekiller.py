import requests

URL = "http://127.0.0.1:3001/chat"

print("🤖 Dekiller está en línea. (Escribe 'salir' para terminar)\n")

while True:
    user_input = input("Tú: ")

    if user_input.lower() == "salir":
        break

    try:
        response = requests.post(URL, json={
            "message": user_input
        })

        data = response.json()

        print("\n🤖 Dekiller:", data.get("reply", "Sin respuesta"), "\n")

    except Exception as e:
        print("❌ Error:", e)
