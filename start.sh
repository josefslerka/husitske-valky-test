#!/bin/bash

# Spouštěcí skript pro Husitské Války
# Spustí lokální web server a otevře hru v prohlížeči

PORT=8000

echo "🎮 Spouštím Husitské Války..."
echo "📡 Server běží na: http://localhost:$PORT"
echo ""
echo "❌ Pro ukončení stiskněte Ctrl+C"
echo ""

# Zkontroluj, jestli Python je nainstalovaný
if command -v python3 &> /dev/null; then
    # Otevři prohlížeč po 1 sekundě (aby server měl čas nastartovat)
    (sleep 1 && open "http://localhost:$PORT") &

    # Spusť Python HTTP server
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    (sleep 1 && open "http://localhost:$PORT") &
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Python není nainstalovaný!"
    echo "Prosím nainstaluj Python nebo otevři index.html přímo v prohlížeči"
    exit 1
fi
