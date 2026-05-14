// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const fs = require('fs');
// const pcapParser = require('pcap-parser');
// const cors = require('cors');
// const Packet = require('./models/Packet');

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* ================== DATABASE ================== */

// mongoose.connect('mongodb://127.0.0.1:27017/dpiDB')
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log(err));

// /* ================== MULTER ================== */

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });

// /* ================== UPLOAD ROUTE ================== */

// app.post('/upload', upload.single('file'), async (req, res) => {

//   try {

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     console.log("Processing:", req.file.originalname);

//     const filePath = req.file.path;

//     // STEP 1: Delete all previous packets
//     await Packet.deleteMany({});
//     console.log("All Previous Data Deleted");

//     const packets = [];

//     const stream = fs.createReadStream(filePath);
//     const parser = pcapParser.parse(stream);

//     parser.on('packet', (packet) => {

//       const raw = packet.data;

//       if (raw.length < 34) return;

//       const ipStart = 14;

//       /* Protocol */
//       const protocolNum = raw[ipStart + 9];

//       let protocol = "OTHER";

//       if (protocolNum === 6) protocol = "TCP";
//       else if (protocolNum === 17) protocol = "UDP";
//       else if (protocolNum === 1) protocol = "ICMP";

//       /* IP */
//       const srcIP = raw.slice(ipStart + 12, ipStart + 16).join('.');
//       const destIP = raw.slice(ipStart + 16, ipStart + 20).join('.');

//       /* Ports */
//       let srcPort = null;
//       let destPort = null;

//       if (protocol === "TCP" || protocol === "UDP") {
//         const transportStart = ipStart + ((raw[ipStart] & 0x0f) * 4);

//         srcPort = raw.readUInt16BE(transportStart);
//         destPort = raw.readUInt16BE(transportStart + 2);
//       }

//       /* Length */
//       const length = raw.length;

//       /* Suspicious */
//       let suspicious = false;

//       if (destPort === 23 || destPort === 4444 || destPort === 3389) {
//         suspicious = true;
//       }

//       if (length > 1500) {
//         suspicious = true;
//       }

//       packets.push({
//         protocol,
//         srcIP,
//         destIP,
//         srcPort,
//         destPort,
//         length,
//         suspicious,
//         filename: req.file.originalname
//       });

//     });

//     parser.on('end', async () => {

//       try {

//         if (packets.length > 0) {
//           await Packet.insertMany(packets);
//         }

//         console.log("Inserted Packets:", packets.length);

//         fs.unlinkSync(filePath);

//         return res.json({
//           message: "PCAP analyzed successfully",
//           totalPackets: packets.length
//         });

//       } catch (insertErr) {
//         console.log(insertErr);
//         return res.status(500).json({ message: "Insert Error" });
//       }

//     });

//     parser.on('error', (err) => {
//       console.log("Parser Error:", err);
//       return res.status(500).json({ message: "Parsing Error" });
//     });

//   }

//   catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Server Error" });
//   }

// });

// /* ================== GET PACKETS ================== */

// app.get('/packets', async (req, res) => {

//   try {
//     const packets = await Packet.find().sort({ _id: -1 });
//     res.json(packets);
//   }

//   catch (err) {
//     res.status(500).json({ message: "Error fetching packets" });
//   }

// });

// /* ================== CLEAR DB ================== */

// app.get('/clear', async (req, res) => {

//   await Packet.deleteMany({});
//   res.json({ message: "Database Cleared" });

// });

// /* ================== PROTOCOL STATS ================== */

// app.get('/stats', async (req, res) => {

//   try {

//     const stats = await Packet.aggregate([
//       { $group: { _id: "$protocol", count: { $sum: 1 } } }
//     ]);

//     res.json(stats);

//   }

//   catch (err) {
//     res.status(500).json({ message: "Stats Error" });
//   }

// });

// /* ================== START SERVER ================== */

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });






// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const fs = require('fs');
// const pcapParser = require('pcap-parser');
// const cors = require('cors');

// const Packet = require('./models/Packet');
//  require('dotenv').config()



// const app = express();


// app.use(cors({
//   origin: 'https://tumhara-frontend.onrender.com'  // apna frontend URL daalo
// }))
//   /* ================== DATABASE ================== */
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log(err));


// /* ================== MULTER ================== */

// const storage = multer.diskStorage({

//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }

// });

// const upload = multer({ storage });

// /* ================== UPLOAD ROUTE ================== */

// app.post('/upload', upload.single('file'), async (req, res) => {

//   try {

//     if (!req.file) {

//       return res.status(400).json({
//         message: "No file uploaded"
//       });

//     }

//     console.log("Processing:", req.file.originalname);

//     const filePath = req.file.path;

//     /* DELETE OLD DATA */

//     await Packet.deleteMany({});

//     console.log("Old packets deleted");

//     const packets = [];

//     /* DUPLICATE REMOVE */

//     const uniquePackets = new Set();

//     const stream = fs.createReadStream(filePath);

//     const parser = pcapParser.parse(stream);

//     parser.on('packet', (packet) => {

//       try {

//         const raw = packet.data;

//         /* IGNORE SMALL PACKETS */

//         if (raw.length < 34) return;

//         /* ETHERNET TYPE */

//         const etherType = raw.readUInt16BE(12);

//         /* ONLY IPV4 */

//         if (etherType !== 0x0800) return;

//         const ipStart = 14;

//         /* IPV4 VERSION CHECK */

//         const version = raw[ipStart] >> 4;

//         if (version !== 4) return;

//         /* PROTOCOL */

//         const protocolNum = raw[ipStart + 9];

//         let protocol = "OTHER";

//         if (protocolNum === 6) protocol = "TCP";
//         else if (protocolNum === 17) protocol = "UDP";
//         else if (protocolNum === 1) protocol = "ICMP";

//         /* SOURCE + DEST IP */

//         const srcIP = raw
//           .slice(ipStart + 12, ipStart + 16)
//           .join('.');

//         const destIP = raw
//           .slice(ipStart + 16, ipStart + 20)
//           .join('.');

//         /* INVALID IP FILTER */

//         if (
//           srcIP === "0.0.0.0" ||
//           destIP === "0.0.0.0"
//         ) {
//           return;
//         }

//         /* IP HEADER LENGTH */

//         const ipHeaderLength =
//           (raw[ipStart] & 0x0f) * 4;

//         const transportStart =
//           ipStart + ipHeaderLength;

//         /* PORTS */

//         let srcPort = null;
//         let destPort = null;

//         if (
//           (protocol === "TCP" ||
//            protocol === "UDP") &&
//           raw.length >= transportStart + 4
//         ) {

//           srcPort =
//             raw.readUInt16BE(transportStart);

//           destPort =
//             raw.readUInt16BE(transportStart + 2);

//         }

//         /* PACKET LENGTH */

//         const length = raw.length;

//         /* SERVICE DETECTION */

//         let service = "-";

//         if (destPort === 80)
//           service = "HTTP";

//         else if (destPort === 443)
//           service = "HTTPS";

//         else if (destPort === 53)
//           service = "DNS";

//         else if (destPort === 21)
//           service = "FTP";

//         else if (destPort === 22)
//           service = "SSH";

//         else if (destPort === 25)
//           service = "SMTP";

//         else if (destPort === 110)
//           service = "POP3";

//         else if (destPort === 143)
//           service = "IMAP";

//         /* SUSPICIOUS DETECTION */

//         let suspicious = false;

//         /* HACKING / BACKDOOR PORTS */

//         if (
//           destPort === 23 ||     // TELNET
//           destPort === 4444 ||   // MALWARE
//           destPort === 3389 ||   // RDP
//           destPort === 5555
//         ) {

//           suspicious = true;

//         }

//         /* LARGE PACKETS */

//         if (length > 1500) {

//           suspicious = true;

//         }

//         /* ICMP FLOOD */

//         if (
//           protocol === "ICMP" &&
//           length > 1000
//         ) {

//           suspicious = true;

//         }

//         /* DUPLICATE REMOVE */

//         const uniqueKey =
//           srcIP +
//           destIP +
//           protocol +
//           srcPort +
//           destPort +
//           length;

//         if (uniquePackets.has(uniqueKey)) {

//           return;

//         }

//         uniquePackets.add(uniqueKey);

//         /* STORE PACKET */

//         packets.push({

//           protocol,
//           srcIP,
//           destIP,
//           srcPort,
//           destPort,
//           service,
//           length,
//           suspicious,
//           filename: req.file.originalname

//         });

//       }

//       catch (packetErr) {

//         console.log("Packet Error:", packetErr);

//       }

//     });

//     /* PARSER END */

//     parser.on('end', async () => {

//       try {

//         if (packets.length > 0) {

//           await Packet.insertMany(packets);

//         }

//         console.log("Inserted Packets:", packets.length);

//         fs.unlinkSync(filePath);

//         return res.json({

//           message: "PCAP analyzed successfully",
//           totalPackets: packets.length

//         });

//       }

//       catch (insertErr) {

//         console.log(insertErr);

//         return res.status(500).json({
//           message: "Insert Error"
//         });

//       }

//     });

//     /* PARSER ERROR */

//     parser.on('error', (err) => {

//       console.log("Parser Error:", err);

//       fs.unlinkSync(filePath);

//       return res.status(500).json({
//         message: "Parsing Error"
//       });

//     });

//   }

//   catch (err) {

//     console.log(err);

//     return res.status(500).json({
//       message: "Server Error"
//     });

//   }

// });

// /* ================== GET PACKETS ================== */

// app.get('/packets', async (req, res) => {

//   try {

//     const packets =
//       await Packet.find().sort({ _id: -1 });

//     res.json(packets);

//   }

//   catch (err) {

//     res.status(500).json({
//       message: "Error fetching packets"
//     });

//   }

// });

// /* ================== CLEAR DB ================== */

// app.get('/clear', async (req, res) => {

//   await Packet.deleteMany({});

//   res.json({
//     message: "Database Cleared"
//   });

// });

// /* ================== PROTOCOL STATS ================== */

// app.get('/stats', async (req, res) => {

//   try {

//     const stats = await Packet.aggregate([

//       {
//         $group: {
//           _id: "$protocol",
//           count: { $sum: 1 }
//         }
//       }

//     ]);

//     res.json(stats);

//   }

//   catch (err) {

//     res.status(500).json({
//       message: "Stats Error"
//     });

//   }

// });

// /* ================== START SERVER ================== */

// app.listen(5000, () => {

//   console.log("Server running on port 5000");

// });




const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const pcapParser = require('pcap-parser');
const cors = require('cors');

const Packet = require('./models/Packet');
require('dotenv').config();

const app = express();

// ✅ CORS FIX - Pehle CORS, phir baaki middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tumhara-frontend.onrender.com'  // apna actual Render URL daalo
  ]
}));

app.use(express.json());

/* ================== DATABASE ================== */

mongoose.connect(process.env.MONGO_URI)
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

      return res.status(400).json({
        message: "No file uploaded"
      });

    }

    console.log("Processing:", req.file.originalname);

    const filePath = req.file.path;

    /* DELETE OLD DATA */

    await Packet.deleteMany({});

    console.log("Old packets deleted");

    const packets = [];

    /* DUPLICATE REMOVE */

    const uniquePackets = new Set();

    const stream = fs.createReadStream(filePath);

    const parser = pcapParser.parse(stream);

    parser.on('packet', (packet) => {

      try {

        const raw = packet.data;

        /* IGNORE SMALL PACKETS */

        if (raw.length < 34) return;

        /* ETHERNET TYPE */

        const etherType = raw.readUInt16BE(12);

        /* ONLY IPV4 */

        if (etherType !== 0x0800) return;

        const ipStart = 14;

        /* IPV4 VERSION CHECK */

        const version = raw[ipStart] >> 4;

        if (version !== 4) return;

        /* PROTOCOL */

        const protocolNum = raw[ipStart + 9];

        let protocol = "OTHER";

        if (protocolNum === 6) protocol = "TCP";
        else if (protocolNum === 17) protocol = "UDP";
        else if (protocolNum === 1) protocol = "ICMP";

        /* SOURCE + DEST IP */

        const srcIP = raw
          .slice(ipStart + 12, ipStart + 16)
          .join('.');

        const destIP = raw
          .slice(ipStart + 16, ipStart + 20)
          .join('.');

        /* INVALID IP FILTER */

        if (
          srcIP === "0.0.0.0" ||
          destIP === "0.0.0.0"
        ) {
          return;
        }

        /* IP HEADER LENGTH */

        const ipHeaderLength =
          (raw[ipStart] & 0x0f) * 4;

        const transportStart =
          ipStart + ipHeaderLength;

        /* PORTS */

        let srcPort = null;
        let destPort = null;

        if (
          (protocol === "TCP" ||
           protocol === "UDP") &&
          raw.length >= transportStart + 4
        ) {

          srcPort =
            raw.readUInt16BE(transportStart);

          destPort =
            raw.readUInt16BE(transportStart + 2);

        }

        /* PACKET LENGTH */

        const length = raw.length;

        /* SERVICE DETECTION */

        let service = "-";

        if (destPort === 80)
          service = "HTTP";

        else if (destPort === 443)
          service = "HTTPS";

        else if (destPort === 53)
          service = "DNS";

        else if (destPort === 21)
          service = "FTP";

        else if (destPort === 22)
          service = "SSH";

        else if (destPort === 25)
          service = "SMTP";

        else if (destPort === 110)
          service = "POP3";

        else if (destPort === 143)
          service = "IMAP";

        /* SUSPICIOUS DETECTION */

        let suspicious = false;

        /* HACKING / BACKDOOR PORTS */

        if (
          destPort === 23 ||     // TELNET
          destPort === 4444 ||   // MALWARE
          destPort === 3389 ||   // RDP
          destPort === 5555
        ) {

          suspicious = true;

        }

        /* LARGE PACKETS */

        if (length > 1500) {

          suspicious = true;

        }

        /* ICMP FLOOD */

        if (
          protocol === "ICMP" &&
          length > 1000
        ) {

          suspicious = true;

        }

        /* DUPLICATE REMOVE */

        const uniqueKey =
          srcIP +
          destIP +
          protocol +
          srcPort +
          destPort +
          length;

        if (uniquePackets.has(uniqueKey)) {

          return;

        }

        uniquePackets.add(uniqueKey);

        /* STORE PACKET */

        packets.push({

          protocol,
          srcIP,
          destIP,
          srcPort,
          destPort,
          service,
          length,
          suspicious,
          filename: req.file.originalname

        });

      }

      catch (packetErr) {

        console.log("Packet Error:", packetErr);

      }

    });

    /* PARSER END */

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

      }

      catch (insertErr) {

        console.log(insertErr);

        return res.status(500).json({
          message: "Insert Error"
        });

      }

    });

    /* PARSER ERROR */

    parser.on('error', (err) => {

      console.log("Parser Error:", err);

      fs.unlinkSync(filePath);

      return res.status(500).json({
        message: "Parsing Error"
      });

    });

  }

  catch (err) {

    console.log(err);

    return res.status(500).json({
      message: "Server Error"
    });

  }

});

/* ================== GET PACKETS ================== */

app.get('/packets', async (req, res) => {

  try {

    const packets =
      await Packet.find().sort({ _id: -1 });

    res.json(packets);

  }

  catch (err) {

    res.status(500).json({
      message: "Error fetching packets"
    });

  }

});

/* ================== CLEAR DB ================== */

app.get('/clear', async (req, res) => {

  await Packet.deleteMany({});

  res.json({
    message: "Database Cleared"
  });

});

/* ================== PROTOCOL STATS ================== */

app.get('/stats', async (req, res) => {

  try {

    const stats = await Packet.aggregate([

      {
        $group: {
          _id: "$protocol",
          count: { $sum: 1 }
        }
      }

    ]);

    res.json(stats);

  }

  catch (err) {

    res.status(500).json({
      message: "Stats Error"
    });

  }

});

/* ================== START SERVER ================== */

app.listen(5000, () => {

  console.log("Server running on port 5000");

});