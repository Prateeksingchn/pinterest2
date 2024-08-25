const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pinterest2");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  fullname: String,
  profileImage: String,
  contact: Number,
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
