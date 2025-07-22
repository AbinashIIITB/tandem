const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    _id: String, // docId
    content: Object, // Slate or TipTap JSON
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
