#!/bin/bash
API_KEY="Sk-or-v1-caed6d6c0f929cf7a7c98c06912ca1065f15eb05b40b303dcc5532766826c735"
while true; do
  echo -n "Tú: "
  read input
  if [ "$input" = "salir" ]; then break; fi

  curl -s http://localhost:3000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d '{
      "model": "google/gemini-2.0-flash-001",
      "messages": [{"role": "user", "content": "'"$input"'"}]
    }' | jq -r '.choices[0].message.content'
  echo -e "\n"
done

