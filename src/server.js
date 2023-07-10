const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const shortid = require('shortid');
const fs = require('fs/promises');
const path = require('path');
const dbLocation = path.resolve('src', 'data.json');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


/**
 * Player Microservice
 * CRUD   -        - Create Read Update Delete
 * Get    - /      - Find all player 
 * Post   - /      - Create a new player and save into db
 * Get    - /:id   - Find a single player by id
 * Put    - /:id   - Update or create player
 * Patch  - /:id   - Update player
 * DELETE - /:id   - Delete player by id
 */

app.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, country, rank } = req.body;
    
    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);

    let player = players.find(p => p.id === id);
    if (!player) {
        player = {
            ...req.body,
            id: shortid.generate()
        }
        players.push(player);
    } else {
        player.name = name ?? player.name;
        player.country = country ?? player.country;
        player.rank = rank ?? player.rank;
    }

    await fs.writeFile(dbLocation, JSON.stringify(players))
    res.status(200).json(player);
})

app.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, country, rank } = req.body;
    
    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);

    const player = players.find(p => p.id === id);
    if (!player) {
        return res.status(404).json({ message: 'Player not found' });
    }

    player.name = name ?? player.name;
    player.country = country ?? player.country;
    player.rank = rank ?? player.rank;

    await fs.writeFile(dbLocation, JSON.stringify(players))
    res.status(200).json(player);
})

app.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);

    const player = players.find(p => p.id === id);
    if (!player) {
        return res.status(404).json({ message: 'Player not found' });
    }

    const newPlayers = players.filter(i => i.id != id);
    await fs.writeFile(dbLocation, JSON.stringify(newPlayers));
    res.status(203).send();
})

app.get('/:id', async (req, res) => {
    const { id } = req.params;

    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);

    const player = players.find(p => p.id === id);
    if (!player) {
        return res.status(404).json({ message: 'Player not found' });
    }
    res.status(200).json(player)
})

app.post('/', async (req, res) => {
    const player = {
        ...req.body,
        id: shortid.generate()
    }
    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);
    players.push(player);
    await fs.writeFile(dbLocation, JSON.stringify(players));
    res.status(201).json(player)
})

app.get('/', async (req, res) => {
    const data = await fs.readFile(dbLocation);
    const players = JSON.parse(data);
    res.status(200).json(players);
})

app.get('/health', (_req, res) => {
    res.send('Welcome to health route!');
})

app.listen(4000, () => {
    console.log('App listen on 4000 PORT');
});