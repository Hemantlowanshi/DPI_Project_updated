const mongoose = require('mongoose');

const PacketSchema = new mongoose.Schema({

    protocol: String,

    srcIP: String,

    destIP: String,

    srcPort: Number,

    destPort: Number,

    length: Number,

    suspicious: Boolean,

    filename: String

});

module.exports = mongoose.model('Packet', PacketSchema);