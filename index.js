require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const token = process.env.BOT_TOKEN;

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

    if (message.content === '!objawy') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('generate_disease')
                    .setLabel('Generuj chorobę')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.author.send({ content: 'Kliknij przycisk, aby wygenerować chorobę i jej objawy.', components: [row] });
        await message.reply({ content: 'Wysłano ci wiadomość z przyciskiem do prywatnych wiadomości.' });
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

        await interaction.user.send({ embeds: [embed] });
        await interaction.reply({ content: 'Wygenerowana choroba została wysłana na Twoje prywatne wiadomości.', ephemeral: true });
    }
});

client.login(token);
