const bookModal = require('../models/Book');
const userModel = require('../models/user')
const loginTokenModal = require('../models/login_token/login_token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const book = require('../setting/book');
const url = process.env.BASE_URL

module.exports = {
    ADDBOOK: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            bookName: data.bookName,
            addedBy: data.userData.Data._id
        };

        var bookData = await bookModal.find(condition);
        if (bookData.length <= 0) {
            const bookdetail = {
                bookName: data.bookName,
                coverImage: data.coverImage,
                description: data.description,
                price: data.price,
                bookType: data.bookType,
                addedBy: data.userData.Data._id
            }
            var respData = await bookModal.create(bookdetail);
            if (respData) {
                sendData['ReturnCode'] = 200;
                sendData['Data'] = respData;
                callback(sendData)
            }

        } else {
            console.log('already');

            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['Data'] = bookData;
            sendData['ReturnMsg'] = "This book already Added";
            callback(sendData)
        }
    },
    MYBOOK: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            addedBy: data.Data._id
        };

        var bookData = await bookModal.find(condition);
        if (bookData.length > 0) {
            sendData['ReturnCode'] = 200;
            sendData['Data'] = bookData;
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book you added yet";
            callback(sendData)
        }
    },
    DETAIL: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };



        //condition
        const user_id = (data.userData.Data._id)
        const book_id = (data.bookId.replace(/[^a-fA-F0-9]/g, ""));


        const condition = {
            _id: book_id
        };
        const bookData = await bookModal.find(condition)
        if (bookData.length > 0) {

            const userData = await userModel.findOne({ _id: user_id })


            if (userData) {
                bookData[0].userName = userData.name
                returnData = {
                    bookName: bookData[0].bookName,
                    coverImage: bookData[0].coverImage,
                    description: bookData[0].description,
                    price: bookData[0].price,
                    addedBy: userData.name,
                    admin: user_id === bookData.addedBy ? true : false,
                    bookType: bookData[0].bookType,
                }
                sendData['ReturnCode'] = 200;
                sendData['Data'] = returnData;
                callback(sendData)
            }
        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book found";
            callback(sendData)
        }
    },
    UPDATE: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };



        //condition
        const user_id = (data.userData.Data._id)
        const book_id = (data.bookId.replace(/[^a-fA-F0-9]/g, ""));
        const bookData = data.bookData;
        const { myBookName, coverImage, description, myBookType, price } = bookData;

        const condition = {
            _id: book_id
        };
        const updateData = {
            bookName: myBookName,
            coverImage: coverImage,
            description: description,
            price: price,
            bookType: myBookType
        }
        const updateBook = await bookModal.update(condition, updateData)
        if (updateBook.length > 0) {

            sendData['ReturnCode'] = 200;
            sendData['Data'] = updateBook;
            sendData['ReturnMsg'] = "Update bookData done";
            callback(sendData)

        } else {
            sendData['ReturnCode'] = 201;
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "No book found";
            callback(sendData)
        }
    },
    ALLBOOK: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        try {
            const { search, type, price } = data.search || {};
            const userId = data.userData?.Data?._id;

            if (!userId) {
                sendData.ReturnCode = 400;
                sendData.err = 1;
                sendData.ReturnMsg = "User not authenticated";
                return callback(sendData);
            }

            const userData = await userModel.findOne({ _id: userId });

            if (!userData) {
                sendData.ReturnCode = 404;
                sendData.err = 1;
                sendData.ReturnMsg = "User not found";
                return callback(sendData);
            }

            let query = {};

            // Enhanced search with safe access
            if (search) {
                query.$or = [
                    { myBookName: { $regex: search, $options: 'i' } },
                    { 'addedBy.name': { $regex: search, $options: 'i' } },
                    { myBookType: { $regex: search, $options: 'i' } }
                ];
            }

            // Existing filters
            if (type) query.myBookType = type;
            if (price) {
                const [min, max] = price.split('-');
                query.price = max ? {
                    $gte: parseFloat(min),
                    $lte: parseFloat(max)
                } : { $gte: parseFloat(min) };
            }

            let bookData = await bookModal.find(query).populate('addedBy', 'name');

            // Safe interest-based sorting
            if (userData.interestedBooks?.length > 0) {
                const userInterests = userData.interestedBooks
                    .filter(b => typeof b === 'string')
                    .map(b => b.toLowerCase());

                const [matches, others] = bookData.reduce((acc, book) => {
                    const bookName = book.myBookName?.toLowerCase() || '';
                    acc[userInterests.includes(bookName) ? 0 : 1].push(book);
                    return acc;
                }, [[], []]);

                if (!search && !type && !price) {
                    others.sort(() => Math.random() - 0.5);
                }
                bookData = [...matches, ...others];
            } else if (!search && !type && !price) {
                bookData = bookData.sort(() => Math.random() - 0.5);
            }

            // Handle empty results with safe suggestions
            if (bookData.length > 0) {
                sendData.Data = bookData;
            } else {
                sendData.ReturnCode = 201;
                sendData.err = 1;

                try {
                    const suggestions = await bookModal.aggregate([
                        { $match: { myBookName: { $exists: true } } },
                        { $sample: { size: 10 } },
                        {
                            $lookup: {
                                from: 'user',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: 'userData'
                            }
                        },
                        { $unwind: '$addedBy' },
                        {
                            $project: {
                                myBookName: 1,
                                myBookType: 1,
                                price: 1,
                                'userData.name': 1
                            }
                        }
                    ]);

                    sendData.Data = suggestions;
                    sendData.ReturnMsg = suggestions.length > 0
                        ? "No results found. Try these suggestions:"
                        : "No books available";
                } catch (suggestError) {
                    console.error("Suggestions error:", suggestError);
                    sendData.ReturnMsg = "No books available";
                }
            }

            callback(sendData);

        } catch (error) {
            console.error("ALLBOOK Error:", error);
            sendData.ReturnCode = 500;
            sendData.err = 1;
            sendData.ReturnMsg = "Server error: " + (error.message || "Unknown error");
            callback(sendData);
        }
    },

}