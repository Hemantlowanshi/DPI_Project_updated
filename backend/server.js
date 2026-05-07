const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const pcapParser = require('pcap-parser');
const cors = require('cors');
const Packet = require('./models/Packet');

const app = express();
app.use(cors());
app.use(express.json());

/* ================== DATABASE ================== */

mongoose.connect('mongodb://127.0.0.1:27017/dpiDB')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================== MULTER ================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================== UPLOAD ROUTE ================== */

app.post('/upload', upload.single('file'), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Processing:", req.file.originalname);

    const filePath = req.file.path;

    // STEP 1: Delete all previous packets
    await Packet.deleteMany({});
    console.log("All Previous Data Deleted");

    const packets = [];

    const stream = fs.createReadStream(filePath);
    const parser = pcapParser.parse(stream);

    parser.on('packet', (packet) => {

      const raw = packet.data;

      if (raw.length < 34) return;

      const ipStart = 14;

      /* Protocol */
      const protocolNum = raw[ipStart + 9];

      let protocol = "OTHER";

      if (protocolNum === 6) protocol = "TCP";
      else if (protocolNum === 17) protocol = "UDP";
      else if (protocolNum === 1) protocol = "ICMP";

      /* IP */
      const srcIP = raw.slice(ipStart + 12, ipStart + 16).join('.');
      const destIP = raw.slice(ipStart + 16, ipStart + 20).join('.');

      /* Ports */
      let srcPort = null;
      let destPort = null;

      if (protocol === "TCP" || protocol === "UDP") {
        const transportStart = ipStart + ((raw[ipStart] & 0x0f) * 4);

        srcPort = raw.readUInt16BE(transportStart);
        destPort = raw.readUInt16BE(transportStart + 2);
      }

      /* Length */
      const length = raw.length;

      /* Suspicious */
      let suspicious = false;

      if (destPort === 23 || destPort === 4444 || destPort === 3389) {
        suspicious = true;
      }

      if (length > 1500) {
        suspicious = true;
      }

      packets.push({
        protocol,
        srcIP,
        destIP,
        srcPort,
        destPort,
        length,
        suspicious,
        filename: req.file.originalname
      });

    });

    parser.on('end', async () => {

      try {

        if (packets.length > 0) {
          await Packet.insertMany(packets);
        }

        console.log("Inserted Packets:", packets.length);

        fs.unlinkSync(filePath);

        return res.json({
          message: "PCAP analyzed successfully",
          totalPackets: packets.length
        });

      } catch (insertErr) {
        console.log(insertErr);
        return res.status(500).json({ message: "Insert Error" });
      }

    });

    parser.on('error', (err) => {
      console.log("Parser Error:", err);
      return res.status(500).json({ message: "Parsing Error" });
    });

  }

  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }

});

/* ================== GET PACKETS ================== */

app.get('/packets', async (req, res) => {

  try {
    const packets = await Packet.find().sort({ _id: -1 });
    res.json(packets);
  }

  catch (err) {
    res.status(500).json({ message: "Error fetching packets" });
  }

});

/* ================== CLEAR DB ================== */

app.get('/clear', async (req, res) => {

  await Packet.deleteMany({});
  res.json({ message: "Database Cleared" });

});

/* ================== PROTOCOL STATS ================== */

app.get('/stats', async (req, res) => {

  try {

    const stats = await Packet.aggregate([
      { $group: { _id: "$protocol", count: { $sum: 1 } } }
    ]);

    res.json(stats);

  }

  catch (err) {
    res.status(500).json({ message: "Stats Error" });
  }

});

/* ================== START SERVER ================== */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});