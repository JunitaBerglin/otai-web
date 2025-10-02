# OTAI - Arbetsterapeutisk AI-assistent 🤖

OTAI är en AI-driven chattapplikation som ger arbetsterapeutiska råd och förslag. Projektet använder Google Gemini AI för intelligenta svar och localStorage för att spara chattsessioner direkt i webbläsaren.

## ✨ Funktioner

- 💬 **AI-driven chatt** med Google Gemini för arbetsterapeutiska råd
- 👤 **Användarautentisering** med localStorage 
- 📝 **Chatthistorik** sparas lokalt i din webbläsare
- 🎨 **Modern UI** med React och Tailwind CSS
- 🔒 **GDPR** - all data lagras lokalt på din enhet

## 🚀 Kom igång

### Förutsättningar

- Node.js 20.19.0 eller senare
- npm eller yarn

### Installation

1. **Installera beroenden**

```bash
npm install
```

2. **Konfigurera Google Gemini API**

   a. Gå till [Google AI Studio](https://aistudio.google.com/app/apikey)

   b. Skapa API-nyckel

   c. Skapa en `.env`-fil i projektmappen:

   d. Öppna `.env` och lägg till din API-nyckel:

   ```
   VITE_GEMINI_API_KEY=din_api_nyckel_här
   ```

3. **Starta utvecklingsservern**

```bash
npm run dev
```

4. **Öppna appen**

   Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare

## 📖 Användning

### Skapa konto

1. Klicka på "Kom igång"
2. Välj "Skapa konto"
3. Fyll i dina uppgifter
4. Välj om du är patient/brukare eller vårdgivare
5. Klicka på "Skapa konto"

### Chatta med OTAI

1. Skriv ditt meddelande i chattfältet
2. OTAI svarar med arbetsterapeutiska råd och förslag
3. All chatthistorik sparas automatiskt i din webbläsare

### Exempel på frågor

- "Jag har svårt att komma ihåg att ta mina mediciner"
- "Jag får ont i ryggen när jag städar"
- "Mitt barn har svårt att koncentrera sig på läxorna"

## 🛠️ Teknisk stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 1.5 Flash 
- **State management**: React hooks
- **Data storage**: localStorage (för denna prototyp version)
- **Build tool**: Vite

## 🌍 Google Gemini API 

[Få API-nyckel här](https://aistudio.google.com/app/apikey)

## 🔧 Utveckling

### Tillgängliga kommandon

```bash
npm run dev      # Starta utvecklingsserver
npm run build    # Bygga för produktion
npm run preview  # Förhandsgranska produktionsbygge
npm run lint     # Kör linter
```

### Rensa all data

Öppna utvecklarkonsolen i din webbläsare och kör:

```javascript
localStorage.clear();
```

## 🔐 Säkerhet och integritet

- **Ingen backend**: All data lagras lokalt på din enhet
- **GDPR-vänlig**: Du kontrollerar all din data
- **API-nyckel**: Läggs endast i din lokala .env-fil
- **Öppen källkod**: All kod är transparent och granskningsbar

## 📝 License

Detta projekt är öppen källkod och tillgängligt för alla.

## 🤝 Bidra

Bidrag är välkomna! Skapa gärna en pull request eller öppna ett issue.

---

**Byggt med ❤️ för arbetsterapeuter och deras klienter**
