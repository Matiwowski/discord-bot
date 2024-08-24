require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const express = require('express');
const http = require('http');

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

const token = process.env.BOT_TOKEN;

const diseases = {
"Grypa": {
        mandatorySymptoms: ["Gorączka", "Suchy kaszel", "Ból głowy w okolicach czoła"],
        optionalSymptoms: ["Zmęczenie", "Ból mięśni", "Nudności", "Biegunka", "Wymioty"],
        testResults: ["Powiększone węzły chłonne", "Podwyższone ciśnienie", "Gorączka", "Szybkie testy wirusowe w kierunku gypy są pozytywne (RIDT: +)", "RT-PCR wskazuje na występowanie materiału genetycznego wirusa grypy"]
    },
"Zapalenie przełyku": {
        mandatorySymptoms: ["Zgaga", "Problemy z połykaniem pokarmu", "Ból w trakcie połykania"],
        optionalSymptoms: ["Gorączka", "Ból mięśni", "Ból głowy", "Zamostkowy, piekący ból w klatce piersiowej"],
        testResults: ["Bioptat (pobrany kawałek) błony śluzowej przełyku mocno zaczerwieniony, z objawami włóknienia", "W badaniu endoskopowym widoczne zmiany krwotoczne przełyku"]
    },
"Napad kamicy nerkowej (Kolka nerkowa)": {
        mandatorySymptoms: ["Ból w okolicy lędźwiowej", "Silne parcie na mocz", "Wydalanie małej ilości moczu na każdą mikcję"],
        optionalSymptoms: ["Nudności", "Wymioty"],
        testResults: ["Krwinkomocz (Obecność zwiększonej ilości krwinek w wydalanym moczu)", "USG uwidacznia złóg i poszerzenie dróg moczowych", "Obecność w moczu kryształów szczawianu wapnia"]
    },
"Ostre zapalenie trzustki (OZT)": {
        mandatorySymptoms: ["Nagły, bardzo silny ból brzucha (w nadbrzuszu)", "Nudności", "Wymioty nieprzynoszące ulgi", "Gorączka", "Osłabienie"],
        optionalSymptoms: ["Ból brzucha promieniuje do kręgosłupa", "Ból w okolicy pępka"],
        testResults: ["Gorączka", "Osłabienie lub zniesienie szmerów perystaltycznych jelit", "Wzmożone napięcie powłok brzusznych", "Tachykardia (przyśpieszona akcja serca)", "Zwiększona aktywność enzymów trzustkowych (>=3x norma)", "Zwiększone stęzenie CRP", "Zwiększone stężenie kreatyniny w surowicy", "USG: powiększenie i zatarcie granic trzustki", "Zwiększona aktywność lipazy w surowicy"]
    },
"Niepowikłane zapalenie pęcherza moczowego": {
        mandatorySymptoms: ["Ból podczas oddawania moczu", "Częste oddawanie moczu", "Ból brzucha (w okolicy nadłonowej)"],
        optionalSymptoms: ["Tkliwość okolicy nadłonowej", "Lekkie zaczerwienienie moczu"],
        testResults: ["Leukocyturia (Obecność zwiększonej ilości leukocytów w moczu)", "Krwiomocz (Obecność krwi w moczu)", "Bakteriomocz (Obecność bakterii w moczu)"]
    },
"Niepowikłane ostre odmiedniczkowe zapalenie nerek (OOZN)": {
        mandatorySymptoms: ["Ból brzucha (w lewym, górnym kwadracie)", "Dreszcze", "Złe samopoczucie", "Gorączka"],
        optionalSymptoms: ["Tkliwość okolicy nadłonowej", "Ból podczas oddawania moczu"],
        testResults: ["Gorączka", "Leukocyturia (Obecność zwiększonej ilości leukocytów w moczu)", "Bakteriomocz (Występowanie białka w moczu)"]
    },
"Ostre zapalenie uchyłków": {
        mandatorySymptoms: ["Ból brzucha (lewego dolnego kwadratu brzucha i podbrzusza)", "Gorączka", "Biegunka"],
        optionalSymptoms: ["Zmiana rytmu wypróżnień"],
        testResults: ["Podczas badania fizykalnego wyczuwalna obrona mięśniowa w okolicach podbrzusza", "Gorączka", "TK jamy brzusznej i miednicy mniejszej wykazuje: pogrubienie ścian okrężnicy i naciek zapalny w tkance tłuszczowej"]
    },
"Zapalenie błony śluzowej żołądka wywołane przez Helicobacter pylori": {
        mandatorySymptoms: ["Rozlany ból brzucha"],
        optionalSymptoms: ["Pieczenie w nadbrzuszu", "Wczesna sytość"],
        testResults: ["Wykrycie H. pylori w kale lub wycinku endoskopowym"]
    },
"Ostre zapalenie błony śluzowej gardła i migdałków (angina) wywołane paciorkowcem PBHA": {
        mandatorySymptoms: ["Nagły, silny ból gardła", "Ból podczas połykania", "Ból głowy", "Nudności", "Gorączka"],
        optionalSymptoms: ["Wymioty"],
        testResults: ["Powiększone węzły chłonne", "Gorączka", "Widoczne zapalenie błony śluzowej gardła (kolor żywoczerwony)", "Na migdałkach widoczny ograniczony wysięk", "Tzw. szyki test na antygen PBHA: wynik dodatni (+)", "Posiew wymazu z gardła i migdałków wskazuje na zakażenie PBHA [+]"]
    },
"Pozaszpitalne zapalenie płuc (PZP)": {
        mandatorySymptoms: ["Ból w klatce piersiowej", "Kaszel", "Gorączka"],
        optionalSymptoms: ["Dreszcze", "Zimne poty", "Ból mięśni"],
        testResults: ["Gorączka", "Tachykardia (przyśpieszona akcja serca)", "Obniżona saturacja (SpO2 < 95%)", "Podczas osłuchiwania klatki piersiowej stwierdza się: trzeszczenia i/lub szmer oskrzelowy", "Stężenie CRP podwyższone (> 20mg/l)", "RTG klatki piersiowej w projekcji tylno przedniej (PA) i bocznej uwidaczniają: zacieniania miąższowe płuc", "TK uwidacznia zmiany w miąższu płuc o charakterze zapalnym", "USG: naciek w miąższu płuc", "posiew plwociny i krwi w kierunku MRSA: ujemy [-]", "popłuczyny z oskrzeli i płyn z płukania oskrzelowo-pęcherzykowego wskazuje na zakażenie bakteryjne"]
    },
"Zakażenie norowirusami": {
        mandatorySymptoms: ["Wodnista biegunka", "Nudności", "Ból brzucha", "Pogorszone samopoczucie"],
        optionalSymptoms: ["Wymioty", "Ból mięśni"],
        testResults: ["RT-qPCR pobranego od pacjetna materiału wykazuje zakażenie norowirusami"]
    },
"Trądzik bez hiperandrogenizmu": {
        mandatorySymptoms: ["Krosty na twarzy"],
        optionalSymptoms: ["Wągry (ciemne zmiany na skórze) w okolicach twarzy", "Białe zaskórniki na twarzy", "Białe zaskórniki na plecach", "Cysty podskórne w okolicach podbródka", "Krosty na plecach"],
        testResults: ["Pobranie wysięku ze zmian skórnych wskazuje na kolonizację przez droboustroje", "Brak znaczących zmian w badaniu aktywności hormonów we krwi"]
    }
};


client.once('ready', () => {
    console.log('Bot jest online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot && message.author.username === 'Ticket Tool') {
        console.log('Received message content:', message.content);
        console.log('Message length:', message.content.length);

        // Sprawdzenie, czy wiadomość zawiera oczekiwany fragment tekstu
        const content = message.content.trim();
        const requiredFragment = 'Utworzyłeś ticket na umówienie się na wizytę z lekarzem! Jeśli usuwasz tatuaż - cennik znajdziesz poniżej.';

        // Sprawdzenie, czy fragment tekstu jest obecny w wiadomości
        if (content.includes(requiredFragment)) {
            try {
                await message.channel.send('Cześć! Potrzebujesz detoksylacji dla postaci ale nie masz pomysłu w jaki sposób to zagrać? Jestem tutaj aby ci pomóc, wystarczy że wpiszesz komendę !objawy a ja zajmę się resztą :)');
                console.log('Sent message: Aby wygenerować objawy wpisz !objawy');
            } catch (error) {
                console.error('Błąd wysyłania wiadomości:', error);
            }
        } else {
            console.log('Message content does not match');
        }
    }

    if (message.content === '!objawy') {
        try {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('generate_disease')
                        .setLabel('Generuj chorobę')
                        .setStyle(ButtonStyle.Primary)
                );

            await message.author.send({ content: 'Kliknij przycisk, aby wygenerować chorobę i jej objawy.', components: [row] });
            await message.reply({ content: 'Wysłano ci wiadomość z przyciskiem do prywatnych wiadomości.' });
            console.log('Sent message with button to user DM');
        } catch (error) {
            console.error('Błąd wysyłania wiadomości prywatnej:', error);
            await message.reply({ content: 'Nie mogłem wysłać ci wiadomości. Sprawdź swoje ustawienia prywatności.' });
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'generate_disease') {
        const diseaseNames = Object.keys(diseases);
        const randomDisease = diseaseNames[Math.floor(Math.random() * diseaseNames.length)];
        const { mandatorySymptoms, optionalSymptoms, testResults } = diseases[randomDisease];

        const embed = new EmbedBuilder()
            .setTitle(`Choroba: ${randomDisease}`)
            .setDescription('Oto objawy i wyniki badań:')
            .addFields(
                { name: 'Objawy obowiązkowe', value: mandatorySymptoms.join(', '), inline: false },
                { name: 'Objawy nieobowiązkowe', value: optionalSymptoms.join(', '), inline: false },
                { name: 'Wyniki badań', value: testResults.join(', '), inline: false }
            )
            .setColor('#FF0000');

        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply({ content: 'Oto twoja choroba oraz podpowiedzi do jej odegrania. Pamiętaj, to jest tylko przykład - możesz wybrać inną chorobę do odegrania, a także łączyć wygenerowane/własne pomysły. Życzę ci miłej zabawy, do zobaczenia!', ephemeral: true });
            console.log('Sent disease info to user DM');
        } catch (error) {
            console.error('Błąd wysyłania wiadomości prywatnej:', error);
            await interaction.reply({ content: 'Nie mogłem wysłać ci wiadomości. Sprawdź swoje ustawienia prywatności, spróbuj ponownie.', ephemeral: true });
        }
    }
});

client.login(token);

// Utrzymywanie bota przy życiu
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running'));

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

// Regularne pingowanie samego siebie co minutę
setInterval(() => {
    http.get(`https://discord-bot-ucid.onrender.com`);
}, 60000);
