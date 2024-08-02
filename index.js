const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Dodaj tę linię

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const token = process.env.BOT_TOKEN; // Użyj zmiennej środowiskowej

const diseases = {
    "Grypa": {
        mandatorySymptoms: ["Gorączka", "Kaszel", "Ból głowy"],
        optionalSymptoms: ["Zmęczenie", "Ból mięśni", "Nudności"]
    },
    "Covid-19": {
        mandatorySymptoms: ["Gorączka", "Kaszel", "Duszność"],
        optionalSymptoms: ["Ból gardła", "Utrata smaku", "Utrata węchu"]
    },
    "Przeziębienie": {
        mandatorySymptoms: ["Katar", "Ból gardła"],
        optionalSymptoms: ["Kaszel", "Ból głowy", "Zmęczenie"]
    },
    "Zapalenie oskrzeli": {
        mandatorySymptoms: ["Kaszel", "Ból w klatce piersiowej"],
        optionalSymptoms: ["Gorączka", "Duszność", "Zmęczenie"]
    },
    "Angina": {
        mandatorySymptoms: ["Ból gardła", "Gorączka"],
        optionalSymptoms: ["Ból głowy", "Ból mięśni", "Trudności w przełykaniu"]
    }
};

client.once('ready', () => {
    console.log('Bot jest online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const member = message.guild.members.cache.get(message.author.id);
    if (member && member.roles.cache.size > 1) {
        return;
    }

    if (message.channel.name.includes('ticket') && message.content.includes('Umów się z lekarzem, bądź rezydentem na wizytę.')) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('generate_disease')
                    .setLabel('Generuj chorobę')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ content: 'Kliknij przycisk, aby wygenerować chorobę i jej objawy.', components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'generate_disease') {
        const diseaseNames = Object.keys(diseases);
        const randomDisease = diseaseNames[Math.floor(Math.random() * diseaseNames.length)];
        const { mandatorySymptoms, optionalSymptoms } = diseases[randomDisease];

        const embed = new EmbedBuilder()
            .setTitle(`Choroba: ${randomDisease}`)
            .setDescription('Oto objawy:')
            .addFields(
                { name: 'Objawy obowiązkowe', value: mandatorySymptoms.join(', '), inline: false },
                { name: 'Objawy nieobowiązkowe', value: optionalSymptoms.join(', '), inline: false }
            )
            .setColor('#FF0000');

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(token);