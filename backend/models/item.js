import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true }
});

const ItemModel = mongoose.model('Item', itemSchema);

export default ItemModel;