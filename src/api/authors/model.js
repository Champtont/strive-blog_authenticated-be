import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const AuthorsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  { timestamps: true }
);

AuthorsSchema.pre("save", async function (next) {
  const currentAuthor = this;

  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;
    const hash = await bcrypt.hash(plainPW, 11);
    currentAuthor.password = hash;
  }
  next();
});

AuthorsSchema.methods.toJSON = function () {
  const authorDocument = this;
  const author = authorDocument.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  return author;
};

AuthorsSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Author", AuthorsSchema);
