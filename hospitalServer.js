const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const saveToFile = (filename, data) => {
  let arr = [];
  if (fs.existsSync(filename)) arr = JSON.parse(fs.readFileSync(filename));
  arr.push(data);
  fs.writeFileSync(filename, JSON.stringify(arr, null, 2));
};

app.post('/submit', async (req, res) => {
  const record = req.body;
  saveToFile('hospital_data.json', record);

  const ref = { uhid: record.uhid, hospitalId: record.hospitalId };

  // Send UHID reference to district, state, country
  try {
    await axios.post('http://localhost:3002/storeRef', ref);
    await axios.post('http://localhost:3003/storeRef', ref);
    await axios.post('http://localhost:3004/storeRef', ref);
    res.send("Record saved in Hospital. Reference sent to District, State & Country.");
  } catch (err) {
    res.send("Saved in Hospital. But failed to notify all levels.");
  }
});

app.get('/getRecord/:uhid', (req, res) => {
  const data = fs.existsSync('hospital_data.json') ? JSON.parse(fs.readFileSync('hospital_data.json')) : [];
  const record = data.find(r => r.uhid === req.params.uhid);
  if (record) res.json(record);
  else res.status(404).send("Record not found.");
});

app.listen(PORT, () => console.log(`🏥 Hospital Server running at http://localhost:${PORT}`));
