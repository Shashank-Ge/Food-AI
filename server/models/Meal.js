const mongoose = require ('mongoose')

const MealSchema = new mongoose.Schema ({
    filename : String,
    food : String,
    health : String,
    reason : String,
    next_meal : String,
    size : Number,
    image_url : String,
    created_at : { type: Date, default : Date.now }
});
 module.exports = mongoose.model("Meal", MealSchema); 