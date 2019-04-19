var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');

/* GET users listing. */

router.post('/idf', function (req,res,next) {
  console.log("bitch las");
    res.send(200);
});
router.get('/test', function(req, res, next) {
  console.log("beeche")
});


let multichain = require("multichain-node")({
  port: 4768,
  host: '127.0.0.1',
  user: "multichainrpc",
  pass: "DXDSfzDgkFdwLud6XNy8i7sDwtMZErJNzFPSSFYH5HM2"
});

const options = {
  host: '3.86.46.74',
  path: '/users/addblock',
  port: '3000',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};
router.post('/createAddress', function (req,res,next) {


  let callback = function (response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      var both_ad = JSON.parse(str);
      var temp = [both_ad.add1, both_ad.add2];
      console.log(temp);
      multichain.addMultiSigAddress({nrequired: 2, keys: temp}, (err, wallet) => {
        if(err){
          res.send(JSON.stringify({status:500, error:err}))
        }
        let req = http.request(options, res => {
          console.log("hello")
        });
        req.write(JSON.stringify({"mad": wallet}));
        req.end();

        multichain.importAddress({"address": wallet}, (err, rep) => {
              console.log(wallet);
              if(err){
                res.send(JSON.stringify({status:500, error:err}))
              }
            }
        );
        // multichain.grant({addresses:wallet, permissions:"send"},(err,rep)=>{
        //   console.log(err);
        // });
        // Must be done by admin



      });

    });

  };
  let my_add;
  multichain.getAddresses({verbose:true},(err, addresses) => {
    //console.log(addresses);
    my_add=addresses[0].pubkey;
    console.log(addresses[0]);
    const req = http.request(options, callback);
    req.write(JSON.stringify({"add":my_add}));
    req.end();
  });

});



router.post('/add',function (req,res,next) {
  //begin
  console.log(req.body);
let callback_hex = function (response) {
  let str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });
  response.on('end', function () {
    let bigger_hex = JSON.parse(str).reply.hex;
    multichain.sendRawTransaction({"hexstring": bigger_hex}, (err, rep) => {
      console.log(err);
      if(err===null){
        res.send(JSON.stringify({status:200}))
      }
      else{
        res.send(JSON.stringify({status:500, error:err}))
        console.log(err)
      }
    })
  });
};
let data_ins = req.body;
let data_arr=[];
for (let i=0; i<data_ins.length; i++){
    data_arr[i]={"for": "multisigstream_1", "key": "key2", "data": {json: data_ins[i]}}
    // data_arr.push({"for": "multisigstream_1", "key": "key2", "data": {json: data_ins[i]}})
}
console.log(data_arr);
multichain.createRawSendFrom({
  from: "4BVDk83KyuzL5TmWRooQcrPeP3n2XMmo2GxTxZ",
  amounts: {},
  data: data_arr,
  action: 'sign'
}, (err, rep) => {
  if(err){
    res.send(JSON.stringify({status:500, error:err}))
  }
  else {
    let req = http.request(options, callback_hex);
    req.write(JSON.stringify({hex: rep.hex}));
    req.end();
  }

})

//end
});
module.exports = router;
