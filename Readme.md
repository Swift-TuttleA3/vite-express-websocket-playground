# Einfache Server/Client Struktur mit Vite, Tailwindcss, Vite-Express, Express, Crossenv, Nodemon und websocket

## Ausgangsbasis ist https://github.com/szymmis/vite-express?tab=readme-ov-file

### Klonen und zum Verzeichnis wechseln

### npm install

### npm run dev

### Redis für Echtzeit-Daten:

## In-Memory-Datenbank, um die aktuellen Pixel-Daten zu speichern und zu aktualisieren. Redis ist schneller als MongoDB für häufige Lese- und Schreiboperationen.

## WebRTC für Peer-to-Peer-Verbindungen: WebRTC für Peer-to-Peer-Verbindungen, um die Last auf dem Server zu reduzieren. WebRTC ermöglicht direkte Verbindungen zwischen Clients.

## GraphQL Subscriptions: GraphQL Subscriptions für Echtzeit-Updates. GraphQL Subscriptions ermöglichen es, nur die benötigten Daten zu abonnieren und zu aktualisieren.

## Batch-Updates: Batch-Updates in der MongoDB durch, um die Anzahl der Schreiboperationen zu reduzieren. Speichern Sie die Änderungen in einem Intervall (z.B. alle 5 Sekunden). Diese Änderungen und Optimierungen sollten die Performance verbessern und sicherstellen, dass die Echtzeit-Updates effizient und schnell sind.
