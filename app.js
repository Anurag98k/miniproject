var debug = require('debug');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var cors = require('cors');
const open = require('open');


var indexRouter = require('./routes/index');
var multisigRouter = require('./routes/multisig');
var idfRouter = require('./routes/idf');
var walletRouter = require('./routes/wallet');


var app = express();
app.options('*', cors());


//
// app.use(function (req, res, next) {
//
//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
//
//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);
//
//   // Pass to next layer of middleware
//   next();
// });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'stylesheets')));
app.use('/', indexRouter);
app.use('/multisig', multisigRouter);
app.use('/idf', idfRouter);
app.use('/wallet', walletRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


let multichain = require("multichain-node")({
    port: 4768,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "ocS83NNFhkmfLpvj8bCPHjtcxo79sApapy4nsSnTid1"
});

callback = function (response) {
    var str = '';
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        var both_ad = JSON.parse(str);
        var temp = [both_ad.add1, both_ad.add2];
        console.log(temp);
        multichain.addMultiSigAddress({nrequired: 2, keys: temp}, (err, wallet) => {
            let options = {
                host: '54.162.66.174',
                path: '/users',
                port: '3000',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            let req = http.request(options, res => {
                console.log("hello")
            });
            req.write(JSON.stringify({"mad": wallet}));
            req.end();

            multichain.importAddress({"address": wallet}, (err, rep) => {
                    console.log(wallet)
                }
            );
            // multichain.grant({addresses:wallet, permissions:"send"},(err,rep)=>{
            //   console.log(err);
            // });
            // Must be done by admin
            let callback_hex = function (response) {
                let str = '';
                response.on('data', function (chunk) {
                    str += chunk;
                });
                response.on('end', function () {
                    let bigger_hex = JSON.parse(str).reply.hex;
                    multichain.sendRawTransaction({"hexstring": bigger_hex}, (err, rep) => {
                        console.log(rep)
                    })
                });
            };
            multichain.createRawSendFrom({
                from: wallet,
                amounts: {},
                data: [{"for": "multisigstream_1", "key": "key2", "data": "48656c6c6f2066726f6d206d756c746973696721"}],
                action: 'sign'
            }, (err, rep) => {
                let req = http.request(options, callback_hex);
                req.write(JSON.stringify({hex: rep.hex}));
                req.end();
            })
        });

    });


};


var options = {
    host: '54.162.66.174',
    path: '/users',
    port: '3000',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
var ad;
multichain.getAddresses({verbose: true}, (err, addresses) => {
    // console.log(addresses);
//   ad=addresses[0].pubkey;
//    //console.log(addresses[0]);
//   // var req = http.request(options, callback);
//   var req = http.request(options, (res)=>{console.log("welocme")});
//   req.write(JSON.stringify({"add":ad}));
//   req.end();
//
//
});
// multichain.publish({stream:"test", key:["038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39","passport"],data:{"json":{"a":"anurag"}}},(err, rep)=>{
//   console.log(err)
// });

multichain.createRawSendFrom({
    from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
        "data": {
            json: {
                father_name: "Ayush Patil",
                meta: {identity: "father_name", verifier: "Department of Public Health", eventType: "Birth"}
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "mother_name", verifier: "Department of Public Health", eventType: "Birth"},
                mother_name: "Piyali Patil"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "dob", verifier: "Department of Public Health", eventType: "Birth"},
                dob: "15-02-1998"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "name", verifier: "Department of Public Health", eventType: "Birth"},
                name: "Rishav Patil"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "gender", verifier: "Department of Public Health", eventType: "Birth"},
                gender: "Male"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "nationality", verifier: "Department of Public Health", eventType: "Birth"},
                nationality: "Indian"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "date_registration", verifier: "Department of Public Health", eventType: "Birth"},
                date_registration: "12-12-1998"
            }
        }
    }], action: "send"
}, (err, rep) => {
    console.log(err);
});


multichain.createRawSendFrom({
    from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
        "data": {
            json: {
                address: {
                    address_hno: "Marigold-125",
                    address_street: "IAF main road",
                    address_city: "Bangalore",
                    address_pin: "560013",
                    address_state: "Karnataka"
                },
                meta: {identity: "address", verifier: "aadhar", eventType: "ID"}
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "number", verifier: "aadhar", eventType: "ID"},
                number: 509127043618
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "dob", verifier: "aadhar", eventType: "ID"},
                dob: "15-02-1998"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "name", verifier: "aadhar", eventType: "ID"},
                name: "Rishav Patil"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "gender", verifier: "aadhar", eventType: "ID"},
                gender: "Male"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "father_name", verifier: "aadhar", eventType: "ID"},
                father_name: "Ayush Patil"
            }
        }
    }], action: "send"
}, (err, rep) => {
    console.log(err);
});

multichain.createRawSendFrom({
    from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
        "data": {
            json: {
                address: {
                    address_hno: "Marigold-125",
                    address_street: "IAF main road",
                    address_city: "Bangalore",
                    address_pin: "560013",
                    address_state: "Karnataka"
                },
                meta: {identity: "address", verifier: "passport", verified_by: "aadhar", eventType: "ID"}
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "number", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                number: "M1320965"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "dob", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                dob: "15-02-1998"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "name", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                name: "Rishav Patil"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "gender", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                gender: "Male"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "country_code", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                country_code: "IND"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "mother_name", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                mother_name: "Piyali Patil"
            }
        }
    },
        {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "father_name", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    father_name: "Ayush Patil"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "type", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    type: "P"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "place_issue", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    place_issue: "Hyderabad"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "date", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    date: {
                        date_of_issue: "20-08-2008",
                        date_of_expiry: "19-08-2018"
                    }
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "pob", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    pob: {
                        pob_city: "Hyderabad",
                        pob_state: "Telangana"
                    }
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "nationality", verifier: "passport", verified_by: "aadhar", eventType: "ID"},
                    nationality: "Indian"
                }
            }
        }], action: "send"
}, (err, rep) => {
    console.log(err);
});


multichain.createRawSendFrom({
    from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
        "data": {
            json: {
                edu_city: "Bangalore",
                meta: {
                    identity: "edu_city",
                    verifier: "PES University",
                    eventType: "Education"
                },
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_name",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_name: "Rishav Patil"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_college",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_college: "PES University"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_sid",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_sid: "01FB15ECS047"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_join",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_join: "15/2/2012"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_end",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_end: "23/2/2016"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "edu_degree",
                    verifier: "PES University",
                    eventType: "Education"
                },
                edu_degree: "B.Tech"
            }
        }
    },
        {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "edu_gender",
                        verifier: "PES University",
                        eventType: "Education"
                    },
                    edu_gender: "Male"
                }
            }
        }], action: "send"
}, (err, rep) => {
    console.log(err);
});

multichain.createRawSendFrom({
    from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
        "data": {
            json: {
                emp_city: "Delhi",
                meta: {
                    identity: "emp_city",
                    verifier: "Microsoft",
                    eventType: "Employment"
                }
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "emp_company",
                    verifier: "Microsoft",
                    eventType: "Employment"
                },
                emp_company: "Microsoft"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {identity: "emp_join", verifier: "Microsoft", eventType: "Employment"},
                emp_join: "12/12/2016"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "emp_eid",
                    verifier: "Microsoft",
                    eventType: "Employment"
                },
                emp_eid: "1002036"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "emp_name",
                    verifier: "Microsoft",
                    eventType: "Employment"
                },
                emp_name: "Nishant"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "emp_gender",
                    verifier: "Microsoft",
                    eventType: "Employment"
                },
                emp_gender: "Male"
            }
        }
    }, {
        "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
            json: {
                meta: {
                    identity: "emp_role",
                    verifier: "Microsoft",
                    eventType: "Employment"
                },
                emp_role: "Senior Architect"
            }
        }
    }], action: "send"
}, (err, rep) => {
    console.log(err);
});


    multichain.createRawSendFrom({
        from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
            "data": {
                json: {
                    marriage_partner1_name: "Ayush Agarwal",
                    meta: {
                        identity: "marriage_partner1_name",
                        verifier: "Municipal Corporation of Marriage",
                        eventType: "Marriage"
                    }
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "marriage_partner2_name",
                        verifier: "Municipal Corporation of Marriage",
                        eventType: "Marriage"
                    },
                    marriage_partner2_name: "Piyali Agarwal"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "marriage_date",
                        verifier: "Municipal Corporation of Marriage",
                        eventType: "Marriage"
                    },
                    marriage_date: "12/04/2017"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "marriage_pastor",
                        verifier: "Municipal Corporation of Marriage",
                        eventType: "Marriage"
                    },
                    marriage_pastor: "Nishant Agarwal"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "marriage_city",
                        verifier: "Municipal Corporation of Marriage",
                        eventType: "Marriage"
                    },
                    marriage_city: "Hyderabad"
                }
            }
        }], action: "send"
    }, (err, rep) => {
        console.log(err);
    });

    multichain.createRawSendFrom({
        from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
            "data": {
                json: {
                    emp_city: "Delhi",
                    meta: {
                        identity: "emp_city",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    }
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "emp_company",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    },
                    emp_company: "LogMeIN"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {identity: "emp_join", verifier: "LogMeIN", eventType: "Employment"},
                    emp_join: "13/04/2018"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "emp_eid",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    },
                    emp_eid: "2402036"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "emp_name",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    },
                    emp_name: "Rishav Patil"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "emp_gender",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    },
                    emp_gender: "Male"
                }
            }
        }, {
            "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "data": {
                json: {
                    meta: {
                        identity: "emp_role",
                        verifier: "LogMeIN",
                        eventType: "Employment"
                    },
                    emp_role: "Product Manager"
                }
            }
        }], action: "send"
    }, (err, rep) => {
        console.log(err);
    });


        multichain.createRawSendFrom({
            from: "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw", amounts: {}, data: [{
                "for": "test20", "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
                "data": {
                    json: {
                        address_old: {
                            address_hno: "Marigold-125",
                            address_street: "IAF main road",
                            address_city: "Bangalore",
                            address_pin: "560013",
                            address_state: "Karnataka"
                        },
                        meta: {
                            identity: "address_old",
                            verifier: "Ministry of Petroleum and Natural Gas",
                            eventType: "Migration"
                        },
                    }
                }
            }, {
                "for": "test20",
                "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
                "data": {
                    json: {
                        meta: {
                            identity: "address_new",
                            verifier: "Ministry of Petroleum and Natural Gas",
                            eventType: "Migration"
                        },
                        address_new: {
                            address_hno: "Block C-125",
                            address_street: "3rd main road",
                            address_city: "Hyderabad",
                            address_pin: "560123",
                            address_state: "Telangana"
                        },
                    }
                }
            }, {
                "for": "test20",
                "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
                "data": {
                    json: {
                        meta: {
                            identity: "address_name",
                            verifier: "Ministry of Petroleum and Natural Gas",
                            eventType: "Migration"
                        },
                        address_name: "Rishav Patil"
                    }
                }
            }, {
                "for": "test20",
                "key": "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39",
                "data": {
                    json: {
                        meta: {
                            identity: "address_change_date",
                            verifier: "Ministry of Petroleum and Natural Gas",
                            eventType: "Migration"
                        },
                        address_change_date: "22/4/2019"
                    }
                }
            },], action: "send"
        }, (err, rep) => {
            console.log(err);
        });


        app.set('port', process.env.PORT || 3001);


        var server = app.listen(app.get('port'), function () {
            debug('Express server listening on port ' + server.address().port);
            open('http://localhost:'+server.address().port+'/');
        });


        module.exports = app;
