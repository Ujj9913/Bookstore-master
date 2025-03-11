const userModal = require('../models/user');
const loginTokenModal = require('../models/login_token/login_token');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const url = process.env.BASE_URL
module.exports = {
    signup: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        var condition = {
            email: data.email
        };

        var usersData = await userModal.find(condition);
        if (usersData.length > 0) {
            usersData = usersData[0]
            if (usersData.temp == true) {
                data.password = md5(data.password);
                var tempCreateData = {
                    name: data.name,
                    password: data.password,
                    temp: false
                }
                const userUpdateData = await userModal.updateOne(condition, tempCreateData)
                if (userUpdateData.matchedCount == 1) {
                    const userData = await userModal.findOne(condition)
                    var payload = {
                        _id: userData._id,
                    };
                    const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
                    var link = `${url}/api/verifyemail/?token=${token}`
                    console.log("link>>", link)
                    // commonController.__sendEmail(usersData.email, link);
                    ejs.renderFile(path.join('/Volumes/D/iu/project/Bookstore-master/templates/confirm_account.ejs'), { link: link }, (err, data) => {
                        console.log("err>>", err)
                        console.log("data>>>", data)
                        if (!err) {
                            console.log(err);
                            var subject = "Confirm your Bookswap account"
                            commonController.__sendEmail(userData.email, subject, data);
                        }
                    })
                }

                var payload = {
                    _id: usersData._id,
                    active: usersData.active,
                    block: usersData.block
                }

                const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                const z = {
                    Y: expireDate.getFullYear(),
                    M: expireDate.getMonth() + 1,
                    d: expireDate.getDate(),
                    h: expireDate.getHours(),
                    m: expireDate.getMinutes(),
                    s: expireDate.getSeconds()
                };

                //give response
                sendData['Data'] = {
                    Userdata: {
                        name: usersData.name,
                        email: usersData.email,
                        email_verify: usersData.email_verify
                    },
                    ReturnMsg: "A One time password has been sent to " + data.email,
                    Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),
                    TokenType: "Bearer",
                    TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
                };
                callback(sendData);
            } else {
                sendData['ReturnCode'] = 201;
                sendData['err'] = 1;
                sendData['ReturnMsg'] = "Email already exists";
                callback(sendData);
            }
        } else {
            //convert password into encripted format
            data.password = md5(data.password);
            data.created_at = new Date();
            data.temp = true
            //insert into database
            var respData = await userModal.create(data);
            //console.log("respData>>", respData)
            const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
            if (respData) {

                var payload = {
                    _id: respData._id,
                };

                const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
                var link = `${url}/api/verifyemail/?token=${token}`
                ejs.renderFile(path.join('/Volumes/D/iu/project/Bookstore-master/templates/confirm_account.ejs'), { link: link }, (err, data) => {
                    console.log("err>>", err)
                    console.log("data>>>", data)
                    if (!err) {
                        console.log(err);
                        var subject = "Confirm your Bookswap account"
                        commonController.__sendEmail(respData.email, subject, data);
                    }
                })

                console.log("link>>", link)

            }
            //generate token for user
            var payload = {
                _id: respData._id,
                active: respData.active,
                block: respData.block
            };
            // const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
            const z = {
                Y: expireDate.getFullYear(),
                M: expireDate.getMonth() + 1,
                d: expireDate.getDate(),
                h: expireDate.getHours(),
                m: expireDate.getMinutes(),
                s: expireDate.getSeconds()
            };

            //give response
            sendData['Data'] = {
                ReturnCode: 200,
                Userdata: {
                    name: respData.name,
                    email: respData.email,

                    email_verify: respData.email_verify,
                    temp: respData.temp
                },
                ReturnMsg: "A One time password has been sent to " + data.email,
                Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),
                TokenType: "Bearer",
                TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
            };
            callback(sendData);
        }
    },
    VERIFY_REGISTER_ACCOUNT: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: "",
        };

        console.log("data>>", data)
        var token = data.token
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (!decoded) {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Your token is not valid";
                callback(sendData);
            }
            if (typeof decoded._id != "undefined") {
                var verifyData = await userModal.find({
                    _id: decoded._id
                })
                console.log("verifyData>>", verifyData)
                if (verifyData.length > 0) {
                    verifyData = verifyData[0]

                    // const userVerifyData = await userModal.updateOne({ _id: decoded._id }, { email_verify: true })
                    let usersData = await userModal.find({ _id: decoded._id })

                    usersData = usersData[0]
                    if (usersData.email_verify == true) {
                        sendData['ReturnCode'] = 200;
                        sendData['err'] = 1;
                        sendData['Data'] = [];
                        sendData['ReturnMsg'] = 'already verify';
                        callback(sendData);
                    }
                    else {
                        var payload = {
                            _id: usersData._id,
                        };

                        usersData.token = jwt.sign(payload, process.env.SECRET_KEY);
                        var userUpdate = {
                            email_verify: true,
                        }
                        const userVerifyData = await userModal.updateOne({ _id: decoded._id }, userUpdate);


                        const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                        const z = {
                            Y: expireDate.getFullYear(),
                            M: expireDate.getMonth() + 1,
                            d: expireDate.getDate(),
                            h: expireDate.getHours(),
                            m: expireDate.getMinutes(),
                            s: expireDate.getSeconds()
                        };
                        sendData['Data'] = {
                            Userdata: {
                                _id: userVerifyData._id,
                                name: userVerifyData.name,
                                email: userVerifyData.email,
                                organization,
                                email_verify: userVerifyData.email_verify,
                                profile_img: userVerifyData.profile_img,

                            },

                            Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),

                            TokenType: "Bearer",
                            TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
                        };
                        sendData['ReturnMsg'] = "email verify successfull"
                        console.log("Userdata>>", sendData['Data'].Userdata)
                        const tokenCreate = {
                            user_id: usersData._id,
                            token: usersData.token,
                        }
                        const token = await loginTokenModal.create(tokenCreate);
                        console.log(token);

                        sendData['Data'].token = token;
                        callback(sendData);


                        // sendData['ReturnCode'] = 200;
                        // sendData['err'] = 0;
                        // sendData["Data"] = {
                        // 	UserData,
                        // }

                        // sendData['ReturnMsg'] = "Your account has been verified"
                        // callback(sendData);
                    }
                } else {
                    sendData['ReturnCode'] = 200;
                    sendData['err'] = 1;
                    sendData['Data'] = [];
                    sendData['ReturnMsg'] = "Something went to wrong";
                    callback(sendData);
                }
            } else {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Something went to wrong";
                callback(sendData);
            }
        } catch (err) {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = err;
            callback(sendData);
        }
    },
    LOGIN: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };

        //condition
        const condition = {
            email: data.email,
            password: md5(data.password),
            deleted: false,
        };

        var usersData = await userModal.find(condition);
        if (usersData.length > 0) {
            console.log("usersData>>", usersData)
            usersData = usersData[0];
            if (usersData.email_verify == false) {
                sendData['ReturnCode'] = 301;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "You cannot login until you confirm your email address. We just emailed you a confirmation.";
                callback(sendData);
            } else {

                var payload = {
                    _id: usersData._id,
                    active: usersData.active,
                    block: usersData.block
                };
                const expireDate = new Date(new Date().setHours(new Date().getHours() + 24));
                const z = {
                    Y: expireDate.getFullYear(),
                    M: expireDate.getMonth() + 1,
                    d: expireDate.getDate(),
                    h: expireDate.getHours(),
                    m: expireDate.getMinutes(),
                    s: expireDate.getSeconds()
                };
                sendData['Data'] = {
                    Userdata: {
                        _id: usersData._id,
                        name: usersData.name,
                        email: usersData.email,
                        email_verify: usersData.email_verify,
                        profile_img: usersData.profile_img,

                    },

                    Token: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" }),
                    TokenType: "Bearer",
                    TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
                };
                sendData['ReturnMsg'] = "Login successful"
                console.log("Userdata>>", sendData['Data'].Userdata)
                const tokenCreate = {
                    user_id: usersData._id,
                    token: sendData['Data'].Token,
                }
                const tokenData = await loginTokenModal.create(tokenCreate);

                callback(sendData);
            }
        } else {
            console.log('Invalid');

            sendData['ReturnCode'] = 400;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Invalid email or password";
            callback(sendData)
        }
    },


    LOGOUT: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get user data into variable
        console.log("data>>", data)
        var userId = data.user_data._id;
        var condition = {
            _id: ObjectId(userId)
        }
        var usersData = await userModal.find(condition)
        console.log("usersData>>", usersData)
        if (usersData.length > 0) {
            usersData = usersData[0]

            let delete_login_token = {
                user_id: ObjectId(userId),
                token: data.token
            }
            let updateTokenData = await loginTokenModal.deleteOne(delete_login_token)
            console.log("updateTokenData>", updateTokenData)

            sendData['ReturnCode'] = 200;
            sendData['err'] = 0;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "You are logout"
            callback(sendData);
        } else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Something went to wrong";
            callback(sendData);
        }
    },
    CHANGE_PASSWORD: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get user data into variable
        var userData = data.userData;
        var old_password = data.old_password;
        var new_password = data.new_password;
        var confirm_password = data.confirm_password;

        //condition
        const condition = {
            _id: ObjectId(userData._id)
        };
        var usersData = await userModal.find(condition);

        //check user modal has data or not
        if (usersData.length > 0) {
            usersData = usersData[0];

            if (usersData.password !== md5(old_password)) {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Your old password is not match with your account."
                callback(sendData);
            } else if (new_password !== confirm_password) {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Password dosn't match with confirm password."
                callback(sendData);
            } else {
                const condition = {
                    _id: ObjectId(userData._id)
                };
                const updateData = {
                    password: md5(new_password)
                };
                //update data into user profile
                const respData = await userModal.updateOne(condition, updateData);
                console.log("respData", respData)
                const delete_token = await loginTokenModal.deleteMany({ user_id: ObjectId(userData._id) })
                console.log("delete_token", delete_token)
                sendData['ReturnCode'] = 200;
                sendData['err'] = 0;
                sendData['ReturnMsg'] = "New password is successfully set with your account."
                callback(sendData);
            }
        } else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "User not login!"
            callback(sendData)
        }
    },
    FORGOT_PASSWORD: async function (data, callback) {
        console.log("data >>", data);
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: "",
        };

        //get user data into variable
        var email = data.email;
        //condition
        var condition = {
            email: email,
            // email_verify: true
        };
        var usersData = await userModal.find(condition);
        console.log("data >>", usersData);
        if (usersData.length > 0) {
            usersData = usersData[0]
            const email = usersData.email
            var payload = {
                _id: usersData._id,

            };
            const token = jwt.sign(payload, process.env.SECRET_KEY);
            var link = `${url}/auth/reset-password/?token=${token}`;
            ejs.renderFile(path.join(__dirname + '../templates/reset_password.ejs'), { link: link }, (err, data) => {
                console.log("err>>", err)
                console.log("data>>>", data)
                if (!err) {
                    console.log(err);
                    var subject = "Forgot your Bookswap account password"
                    commonController.__sendEmail(email, subject, data);
                }
            })

            const delete_token = await loginTokenModal.deleteMany({ user_id: ObjectId(usersData._id) })
            console.log("delete_token", delete_token)

            sendData['ReturnCode'] = 200;
            sendData['err'] = 0;
            sendData['Data'] = token;
            sendData['ReturnMsg'] = `Send email to ${email}`
            callback(sendData)
        } else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "Email not found"
            callback(sendData)
        }
    },
    RESET_FORGOT_PASSWORD: async function (data, callback) {
        //send data
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };
        //get data into variabl

        const token = data.token
        const password = md5(data.password)
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (typeof decoded._id != "undefined") {

                var verifyData = await userModal.find({
                    _id: decoded._id
                })
                console.log("verifyData>>", verifyData)

                if (verifyData.length > 0) {
                    verifyData = verifyData[0]


                    var findData = await userModal.find({ email: verifyData.email })
                    console.log("findData>", findData)

                    if (findData.length > 0) {
                        findData = findData[0]
                        console.log("findData>>", findData)

                        const updateData = await userModal.updateOne({ email: findData.email }, { password: password })
                        const delete_token = await loginTokenModal.deleteMany({ user_id: ObjectId(findData._id) })
                        console.log("delete_token", delete_token)

                        sendData['ReturnCode'] = 200;
                        sendData['err'] = 0;
                        sendData['ReturnMsg'] = "Your password reset";
                        callback(sendData);
                    }
                } else {
                    sendData['ReturnCode'] = 200;
                    sendData['err'] = 1;
                    sendData['Data'] = [];
                    sendData['ReturnMsg'] = "Something went to wrong";
                    callback(sendData);
                }
            } else {
                sendData['ReturnCode'] = 200;
                sendData['err'] = 1;
                sendData['Data'] = [];
                sendData['ReturnMsg'] = "Something went to wrong";
                callback(sendData);
            }
        } catch (err) {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = err;
            callback(sendData);
        }
    },
    GET_PROFILE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: [],
            ReturnMsg: ""
        };
        //get user data into variable
        console.log("data>>", data)
        var userId = data._id;
        var condition = {
            _id: ObjectId(userId)
        }

        var usersData = await userModal.find(condition)
        console.log("usersData>>", usersData)
        if (usersData.length > 0) {
            sendData['Data'] = usersData[0];
            callback(sendData);
        } else {
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "Something went to wrong";
            callback(sendData);
        }
    },
    UPDATE_PROFILE: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: [],
            ReturnMsg: ""
        };
        //get user data into variable
        console.log("data><<<<<<>", data);

        let update_body = data.updateBody;
        const user_id = data.userData._id;
        const condition = {
            _id: ObjectId(user_id)
        }
        const userData = await userModal.findOne(condition)

        if (userData) {
            const updateUser = await userModal.findOneAndUpdate(condition, update_body)
            console.log("updateUser12121212", updateUser);

            if (updateUser && userData.matchedCount > 0) {
                sendData['Data'] = update_body;
                sendData['ReturnMsg'] = "Profile updated successfully";
                callback(sendData);
            } else {
                sendData['err'] = 1;
                sendData['ReturnMsg'] = "Something went wrong";
                callback(sendData);
            }
        } else {
            sendData['err'] = 1;
            sendData['ReturnMsg'] = "User data not found";
            callback(sendData);
        }
    },
    DELETE_USER: async function (data, callback) {
        var sendData = {
            Returncode: 200,
            err: 0,
            Data: {},
            ReturnMsg: ""
        };


        const condition = {
            _id: data.userData._id,

        }

        var userdata = await userModal.find(condition)

        if (userdata.length > 0) {
            const updatedata = {
                deleted: true,
            }
            const respdata = await userModal.updateOne(condition, updatedata)
            sendData['ReturnCode'] = 200,
                sendData['err'] = 0,
                sendData['Data'] = [];
            sendData['ReturnMsg'] = "User deleted";
            callback(sendData);
        }
        else {
            sendData['ReturnCode'] = 200;
            sendData['err'] = 1;
            sendData['Data'] = [];
            sendData['ReturnMsg'] = "No record found";
            callback(sendData);
        }
    },
    RESEND_EMAIL: async function (data, callback) {
        var sendData = {
            ReturnCode: 200,
            err: 0,
            Data: [],
            ReturnMsg: ""
        };
        console.log("data>", data)
        let email = data.email
        let condition = { email }
        let user = await userModal.findOne(condition)
        console.log("user>", user)
        let payload = { _id: user._id }
        const expireDate = new Date(new Date().setHours(new Date().getHours() + 24))
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "24h" });
        let link = `${url}/api/verifyemail/?token=${token}`
        console.log("link>>", link)
        // commonController.__sendEmail(usersData.email, link);
        ejs.renderFile(path.join('/Volumes/D/iu/project/Bookstore-master/templates/confirm_account.ejs'), { link: link }, (err, data) => {
            console.log("err>>", err)
            console.log("data>>>", data)
            if (!err) {
                console.log(err);
                var subject = "Confirm your Bookswap account"
                commonController.__sendEmail(email, subject, data);
            }
        })
            ;
        console.log("expireDate>", expireDate)
        const z = {
            Y: expireDate.getFullYear(),
            M: expireDate.getMonth() + 1,
            d: expireDate.getDate(),
            h: expireDate.getHours(),
            m: expireDate.getMinutes(),
            s: expireDate.getSeconds()
        };
        console.log("z>", z)

        sendData['Data'] = {
            Token: token,
            TokenType: "Bearer",
            TokenExpire: z.Y + "-" + ((z.M > 9) ? z.M : '0' + z.M) + "-" + ((z.d > 9) ? z.d : '0' + z.d) + " " + ((z.h > 9) ? z.h : '0' + z.h) + ":" + ((z.m > 9) ? z.m : '0' + z.m) + ":" + ((z.s > 9) ? z.s : '0' + z.s)
        };
        sendData['ReturnMsg'] = "Email resend to " + email,
            callback(sendData);
    }
}