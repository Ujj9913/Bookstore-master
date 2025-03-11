userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    email_verify: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    temp: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
        default: new Date()
    },

    country_code: {
        type: String,
        default: "+49"
    },
    number: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    postcode: {
        type: Number,
        default: ""
    },
    interestedBooks: {
        type: [String],
        default: []
    },
    profile_img: {
        data: Buffer,
        contentType: String
    },
})

const userModal = mongoose.model('user', userSchema);
module.exports = userModal;