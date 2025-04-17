// countryServer.js
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3004;
const LEVEL_NAME = "Country";
const FILE_NAME = 'country_data.json';

app.use(cors());
app.use(express.json());

const saveToJson = (file, data) => {
  let arr = [];
  if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file));
  arr.push(data);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
};

app.post('/storeRef', (req, res) => {
  const ref = { ...req.body, timestamp: new Date().toISOString() };
  saveToJson(FILE_NAME, ref);
  console.log(`📦 ${LEVEL_NAME} stored UHID: ${ref.uhid}`);
  res.send(`${LEVEL_NAME} stored UHID.`);
});

app.get('/references', (req, res) => {
  if (!fs.existsSync(FILE_NAME)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(FILE_NAME));
  res.json(data);
});

app.get('/getRecord/:uhid', async (req, res) => {
  const data = fs.existsSync(FILE_NAME) ? JSON.parse(fs.readFileSync(FILE_NAME)) : [];
  const ref = data.find(r => r.uhid === req.params.uhid);
  if (!ref) return res.status(404).send("UHID not found.");

  try {
    const response = await axios.get(`http://localhost:3001/getRecord/${ref.uhid}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).send("Failed to retrieve full record from Hospital.");
  }
});

app.listen(PORT, () => console.log(`🌐 ${LEVEL_NAME} Server running at http://localhost:${PORT}`));
