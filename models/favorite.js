var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// const dishesSchema = new Schema({


// })

const favoriteSchema = new Schema({
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
        timestamps: true
    });

var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;