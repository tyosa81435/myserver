const express = require('express');
const app = express();
const PORT = 3000;

const users = new Map();
const publicLevels = new Map();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!users.has(username)) {
    return res.json({ error: 'Invalid username!' });
  }
  if (users.get(username).password !== password) {
    return res.json({ error: 'Invalid password!' });
  }
  res.json({ error: 'ok' });
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (users.has(username)) {
      return res.json({ error: 'Username already exists!' });
    }
    users.set(username, {});
    res.json({ error: 'ok' });
});

app.post('/sync', (req, res) => {
  const { playerData } = req.body;
  if (!users.has(playerData.username)) {
    console.log("SYNC: USERNAME NOT FOUND");
    return;
  }
  users.set(playerData.username, playerData);
  for (const level of playerData.publishedLevels) {
    if (!!level.sentToServer != !!publicLevels.has(level.id)) {
      console.log("LEVEL STATUS MISMATCH");
    }
    if (!level.sentToServer) {
      level.sentToServer = true;
      publicLevels.set(level.id, level);
    }
  }
  console.log("SYNC: DONE: ", playerData.username);
  res.json(playerData);
});

app.post('/load', (req, res) => {
  const { playerData } = req.body;
  if (!users.has(playerData.username)) {
    console.log("LOAD: USERNAME NOT FOUND");
    return;
  }
  console.log("LOAD: DONE: ", playerData.username);
  res.json(users.get(playerData.username));
});

app.post('/getlevels', (req, res) => {
  console.log("SENDING LEVELS ", publicLevels.size);
  res.json([...publicLevels]);
});

app.listen(PORT, () => {
  console.log('Server is running...');
});
