const exec = require('child_process').exec;
var express = require('express');
var router = express.Router();
const http = require('http');
const url = require('url');
// const open = require('open');
const path = require('path');
const fs = require('fs');
// const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
// const session = require('express-session');
// const multer = require('multer');
const request = require('request');
const os = require('os');



//Variables
const rpcVar = {};
var walletServer = 'http://ec2-3-83-141-28.compute-1.amazonaws.com:3001'
const ipNear = '3.83.141.28:4769'


function GetRPC() {
  var rpcPath;

  if(os.platform() == 'win32'){rpcPath = path.join(os.homedir(),'AppData','Roaming','Multichain','aish1','multichain.conf');}
  if(os.platform() == 'linux'){rpcPath = path.join(os.homedir(),'.multichain','aish1','multichain.conf');}
  var fs = require('fs');
  var array = fs.readFileSync(rpcPath).toString().split("\n");
  for(i in array) {
      tp = array[i].split('=');
      console.log(tp[0]);
    rpcVar[tp[0]] = tp[1];
  }

}


//GetRPC();
let multichain = require("multichain-node")({
  port: 4768,
  host: '127.0.0.1',
  user: rpcVar.rpcuser,
  pass: rpcVar.rpcpassword
});



// Init the Multichain, with IP address call
router.get('/multichain/init', (req,res,next) => {
    var cmd = 'multichaind aish1@'+ipNear+' -daemon > multichain_init.txt';
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        console.log("exec_error");
        console.log(err);
        res.send({result:'failed'});
        res.end()
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      console.log('Done');
      res.send({result:'done'});
      res.end();
    });
});


// multichaind start
router.get('/multichain/start', (req,res,next) => {
  var cmd = 'START /B multichaind aish1 -daemon > multichain_start.txt';
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log(err);
      res.send({result:'failed'});
      res.end()
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log('Done');

  });
  res.send({result:'done'});
  res.end();
});

//multichain stop
router.get('/multichain/stop', (req,res,next) => {
  var cmd = 'multichain-cli aish1 stop';
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log("exec_error");
      res.send({result:'failed'});
      res.end()
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log('Done');
    res.send({result:'done'});
    res.end();
  });

});

//Wallet restore -
//call multichain init before, followed by multichain/stop, then finally multichain/restore
router.post('/multichain/restore', (req,res,next) => {
  var pwd = __dirname;
  console.log('Entered Restore Node');
  var authToken = req.body.token;
  var requestSettings = {
      url: walletServer+'/get/wallet',
      encoding: null,
      json:{token:authToken}
  };
  request.post(requestSettings, function (error, response, body) {
    console.log('Got response from wallet');
    if (!error && response.statusCode == 200){
      //console.log(body)
      fs.writeFileSync(path.join(__dirname,"wallet.dat"), body, "binary", function(err, data) {
         if (err) console.log(err);
       });
      console.log('Got Wallet');
       var cmd_move_wallet;
       if(os.platform() == 'win32'){cmd_move_wallet = 'MOVE /Y '+path.join(__dirname,'wallet.dat')+' '+path.join(os.homedir(),'AppData','Roaming','Multichain','aish1','wallet.dat')}
       if(os.platform() == 'linux'){cmd_move_wallet = 'cp '+path.join(__dirname,'wallet.dat')+' '+path.join(os.homedir(),'.multichain','aish1','wallet.dat')}
       exec(cmd_move_wallet, (err, stdout, stderr) => {
         if (err) console.log(err);
         var cmd_delete_wallet;
         if(os.platform() == 'win32'){cmd_delete_wallet = 'del '+path.join(__dirname,'wallet.dat');}
         if(os.platform() == 'linux'){cmd_delete_wallet = 'rm '+path.join(__dirname,'wallet.dat');}
         exec(cmd_delete_wallet, (err,stdout,stderr) => {
           if(err) console.log(err);
           console.log('DONE');
           res.send({status:'done',next:'wallet/multichain/start'});
           res.end();
         });
       });

    }
  });

});

//wallet backup
router.post('/multichain/backup', (req,res,next) => {
  var authToken = req.body.token;
  console.log('Entered Backup Node');
  var cmd_stop = 'multichain-cli aish1 stop';
  exec(cmd_stop, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      console.log("exec_error");
    }
    console.log(`stdout-stopped node: ${stdout}`);
    console.log(`stderr -stopped node: ${stderr}`);
    console.log('Done -stopped node');
    //Step 2 - Backup Call to server:
    var uri;
    if(os.platform() == 'win32'){uri = path.join(os.homedir(),'AppData','Roaming','Multichain','aish1','wallet.dat');}
    else{
      uri = path.join(os.homedir(),'.multichain','aish1','wallet.dat');
    }
    const formData = {
      token:authToken,
      File: {
        value:  fs.createReadStream(uri),
        options:  {
          filename: 'wallet.dat'
        }
      }
    }
    request.post({url:walletServer+'/post/wallet', formData: formData }, function (error, response, body) {
          console.log('error:', error); // Print the error if one occurred
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.
          if (!error && response.statusCode == 200) {
            console.log('Successful wallet backup');
            //Step 3 -start multichain server again.

            let cmd_start = 'START /B multichaind aish1 -daemon > multichain_start.txt';
            console.log('HERE');
            exec(cmd_start, (err, stdout, stderr) => {
              if (err) {
                // node couldn't execute the command
                console.log("exec_error");
                return;
              }
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
              console.log('Done');

            });
            res.send({result:'done'});
            res.end();
          }
          else{
            //start multichain server
            res.send({status:'failed',type:'walletBackup',call:'multichainStart'});
            res.end();
          }

      });
  });
});


















module.exports = router;
