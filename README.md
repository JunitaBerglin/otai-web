# OTAI - Arbetsterapeutisk AI-assistent 🤖

OTAI är en AI-driven chattapplikation som ger arbetsterapeutiska råd och förslag. Projektet använder Google Gemini AI för intelligenta svar och localStorage för att spara chattsessioner direkt i webbläsaren.

## ✨ Funktioner

- 💬 **AI-driven chatt** med Google Gemini för arbetsterapeutiska råd
- 👤 **Användarautentisering** med localStorage (ingen backend krävs)
- 📝 **Chatthistorik** sparas lokalt i din webbläsare med auto-arkivering efter 3 timmar
- 📋 **Remiss-system** - Eskalering till legitimerade arbetsterapeuter när behov upptäcks
- ✉️ **Email-integration** via EmailJS för att skicka remisser
- 🎨 **Modern UI** med React och Tailwind CSS, fullt responsiv för mobil och desktop
- 🔒 **GDPR-vänlig** - all data lagras lokalt på din enhet

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

   b. Skapa en gratis API-nyckel (ingen kreditkort krävs!)

   c. Skapa en `.env`-fil i projektmappen:

   ```bash
   cp .env.example .env
   ```

   d. Öppna `.env` och lägg till din API-nyckel:

   ```
   VITE_GEMINI_API_KEY=din_api_nyckel_här
   ```

   e. (Valfritt) Konfigurera EmailJS för remiss-funktionen:

   - Skapa konto på [EmailJS](https://www.emailjs.com/)
   - Skapa en email service och template
   - Lägg till dina EmailJS-värden i `.env`:

   ```
   VITE_EMAILJS_SERVICE_ID=din_service_id
   VITE_EMAILJS_TEMPLATE_ID=din_template_id
   VITE_EMAILJS_PUBLIC_KEY=din_public_key
   VITE_THERAPIST_EMAIL=din_email@exempel.se
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

### Remiss till legitimerad arbetsterapeut

OTAI fungerar som en första bedömning och kan ge dig råd och förslag. När OTAI identifierar att du behöver mer omfattande hjälp (t.ex. fysiska hjälpmedel, hembesök, personlig uppföljning), visas en **"Remiss"-knapp** i gränssnittet.

**Eskalering sker när:**

- Fysiska hjälpmedel behövs (rollator, greppstöd, tekniska lösningar)
- Personlig bedömning krävs (hembesök, arbetsplatsbesök)
- Kontinuerlig uppföljning behövs
- Användaren uttrycker frustration eller har komplex situation
- Efter 5-7 meddelanden utan tydlig förbättring

**Remissprocessen:**

1. Klicka på "Remiss"-knappen när den visas
2. Fyll i formul\u00e4ret med dina kontaktuppgifter och behov (5 steg)
3. OTAI förifyller konversationssammanhang automatiskt
4. Godkänn GDPR-samtycke och skicka
5. Legitimerade arbetsterapeuter får din remiss via email och kontaktar dig

### Exempel på frågor

- "Jag har svårt att komma ihåg att ta mina mediciner"
- "Jag får ont i ryggen när jag städar"
- "Mitt barn har svårt att koncentrera sig på läxorna"
- "Jag behöver hjälp med att anpassa mitt hem för min rullstol"

## 🛠️ Teknisk stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 1.5 Flash (gratis tier)
- **State management**: React hooks
- **Data storage**: localStorage (ingen databas behövs)
- **Build tool**: Vite

## 🌍 Google Gemini API (Gratis!)

Google Gemini erbjuder en generös gratis tier:

- ✅ **60 requests per minut**
- ✅ **1500 requests per dag**
- ✅ **Ingen kreditkort krävs**
- ✅ **Perfekt för prototyper och utveckling**

[Få din API-nyckel här](https://aistudio.google.com/app/apikey)

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
