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
        mandatorySymptoms: ["Gorączka", "Kaszel", "Ból głowy"],
        optionalSymptoms: ["Zmęczenie", "Ból mięśni", "Nudności"],
        testResults: ["Powiększone węzły chłonne", "Podwyższone ciśnienie", "Gorączka"]
    },
    "Covid-19": {
        mandatorySymptoms: ["Gorączka", "Kaszel", "Duszność"],
        optionalSymptoms: ["Ból gardła", "Utrata smaku", "Utrata węchu"],
        testResults: ["Powiększone węzły chłonne", "Podwyższone ciśnienie", "Gorączka", "Zmniejszona saturacja tlenu"]
    },
    "Przeziębienie": {
        mandatorySymptoms: ["Katar", "Ból gardła"],
        optionalSymptoms: ["Kaszel", "Ból głowy", "Zmęczenie"],
        testResults: ["Lekko podwyższone ciśnienie", "Niewielka gorączka"]
    },
    "Zapalenie oskrzeli": {
        mandatorySymptoms: ["Kaszel", "Ból w klatce piersiowej"],
        optionalSymptoms: ["Gorączka", "Duszność", "Zmęczenie"],
        testResults: ["Podwyższone ciśnienie", "Powiększone węzły chłonne", "Gorączka"]
    },
    "Angina": {
        mandatorySymptoms: ["Ból gardła", "Gorączka"],
        optionalSymptoms: ["Ból głowy", "Ból mięśni", "Trudności w przełykaniu"],
        testResults: ["Powiększone węzły chłonne", "Gorączka", "Obrzęk gardła"]
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
        const requiredFragment = 'Utworzyłeś ticket na umówienie się na wizytę z lekarzem!';

        // Sprawdzenie, czy fragment tekstu jest obecny w wiadomości
        if (content.includes(requiredFragment)) {
            try {
                await message.channel.send('Aby wygenerować objawy wpisz !objawy');
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
            await interaction.reply({ content: 'Wygenerowana choroba została wysłana na Twoje prywatne wiadomości.', ephemeral: true });
            console.log('Sent disease info to user DM');
        } catch (error) {
            console.error('Błąd wysyłania wiadomości prywatnej:', error);
            await interaction.reply({ content: 'Nie mogłem wysłać ci wiadomości. Sprawdź swoje ustawienia prywatności.', ephemeral: true });
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
    http.get(`http://localhost:${PORT}`);
}, 60000);