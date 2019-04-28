var express = require('express');
var router = express.Router();
var url = require('url');

let multichain = require("multichain-node")({
    port: 4768,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "3JoVoQ4kJqbBYSDyjkVEsEYZa51rFdyUbKojy1z9VdNZ"
});

var formFields;
router.get ('/test', function (req,res,next) {
    // if(req.url==='/test'){
    //     console.log("11")
    // }
    console.log("11");
    if(formFields===undefined && req.url==='/test'){
        console.log("Ss");
        res.render('test', {title: ""});
    }
    else {
        if(formFields!==undefined) {
            let url_parts = url.parse(formFields, true);
            let query = url_parts.query;
            // formFields=query.key
            console.log(query);
            res.render('test',{title:query.key});
        }
        else {
            formFields = req.url;
            console.log("12333");
            // res.render('index',{title:formFields});
            res.send(200);
        }
    }
    // res.send("Ddd")
});


/* GET home page. */
router.get('/getDetails', function(req, res, next) {
    console.log("messagw");
    multichain.getAddresses((err, add) => {
        // res.status(200).send(add);
        console.log(add);
    });
    // multichain.listStreamKeyItems({stream:"test",key: req.body.p })
    // console.log(req)
    var queryData = url.parse(req.url, true).query;
    // var url_parts = url.parse(req.url, true);
    // var req_obj = url_parts.query;
    let response_data=new Object();
    req_fields=Object.keys(queryData);
    multichain.listStreamKeyItems({stream:"test23",key: "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39" },(err,rep)=>{
        console.log(rep);
        for(i=0; i<rep.length;i++){
            for(j=0; j<req_fields.length;j++) {
                // console.log(req_fields[j]);
                // console.log(rep[i].keys);
                if (rep[i].keys.includes(req_fields[j])){
                    response_data[req_fields[j]]={
                        data:rep[i].data.json[req_fields[j]],
                        keys:rep[i].keys,
                        txid:rep[i].txid
                    }
                }
            }
        }
        console.log(JSON.stringify(response_data));
            res.status(200).send(response_data);

    });


});

router.get('/getDetails1', function(req, res, next){
    var queryData = url.parse(req.url, true).query;
    // var url_parts = url.parse(req.url, true);
    // var req_obj = url_parts.query;
    let response_data={};
    let req_fields=Object.keys(queryData);
    console.log(req_fields);
    multichain.listStreamKeyItems({stream:"test23",key: "038c6839a164a8cd4d61e3de5177b1f52ef8f13d76325f9844fe701fb5daff5b39", "verbose": false, "count": 9999 },(err,rep)=>{

        // console.log(rep[0].data.json);
        // console.log(JSON.stringify(response_data));
        // res.status(200).send(rep[0].data.json);
        if(err){
            console.log(err);
        }
        let count=0;
        // console.log(rep)
        for (let i=0; i<rep.length;i++){
            let key=rep[i].data.json.meta.identity;
            console.log(key);
            if(req_fields.includes(key)){
                response_data[key]=rep[i].data.json;
                response_data[key]["txid"]=rep[i].txid;
                if(rep[i].data.json.meta.hasOwnProperty("verified_by")){
                    response_data[key]["verified_by"]=rep[i].data.json.meta["verified_by"];
                }
                for( let i = 0; i < req_fields.length; i++){
                    if ( req_fields[i] === key) {
                        req_fields.splice(i, 1);
                    }
                }
            }
            if(req_fields.length===1){
                console.log(response_data);
                res.status(200).send(response_data);
                break;
            }
            // console.log(response_data);
        }

    });
});

module.exports = router;
