bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: false
    },
    price: {
        type: Number
    },
    addedBy: {
       type: ObjectId,
       required: true
    },
    bookType:{
        type: String
    },
    created_at: {
        type: Date      
    },
    updated_at: {
        type: Date,
        default: new Date()
    }
})

const userModal = mongoose.model('Book', bookSchema);
module.exports = userModal;