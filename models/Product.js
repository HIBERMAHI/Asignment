const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      trim: true,
      required: true,
    },
    productId: { type: String, unique: true },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    itemImage: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.pre("save", async function () {
  if (!this.productId) {
    const lastProduct = await mongoose
      .model("Product")
      .findOne()
      .sort({ _id: -1 });

    // ADD THIS BLOCK
    const lastIdNumber = lastProduct
      ? parseInt(lastProduct.productId.replace(/#/g, ""))
      : 645340;

    this.productId = "#" + (lastIdNumber + 1);
  }
});

module.exports = mongoose.model("Product", ProductSchema);
