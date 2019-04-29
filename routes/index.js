// let multichain = require("multichain-node")({
//     port: 4768,
//     host: '127.0.0.1',
//     user: "multichainrpc",
//     pass: "Eje1NRp6ePmSoeMKaSL2BFzkGHxtSTYEm2rwzxUKnJYw"
// });

// multichain.getInfo((err, info) => {
//     if(err){
//         throw err;
//     }
//     //console.log(info);
// });
const path = require('path');
const fs = require('fs');
const os = require('os');
var express = require('express');
var router = express.Router();
var url = require("url");
const rpcVar = {};

function GetRPC() {
  var rpcPath;

  if(os.platform() == 'win32'){rpcPath = path.join(os.homedir(),'AppData','Roaming','Multichain','aish1','multichain.conf');}
  if(os.platform() == 'linux'){rpcPath = path.join(os.homedir(),'.multichain','aish1','multichain.conf');}
  
  var fs = require('fs');
  var array = fs.readFileSync(rpcPath).toString().split("\n");
  console.log(array);
  for(i in array) {
      tp = array[i].split('=');
      // console.log(tp[0]);
      // console.log(tp[1]);
      data_tp = ''
      if(tp != ''){data_tp = tp[1].split('\r')[0];}
    rpcVar[tp[0]] = data_tp;
  }

}




/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Success' });
  //res.send(JSON.stringify({"confirmed":true}));
  var http = require("http");
	var options ={
        hostname: '54.80.5.92',
        port: 3000,
        path: '/users/confirmed',
        method: 'POST',
        headers: {
                'Content-Type': 'application/json',
        }
	};

	var reqi = http.request(options, function(resi) {

	resi.setEncoding('utf8');
	resi.on('data', function (body) {
        console.log('Body: ' + body);
        });
	});
    reqi.on('error', function(e) {
            console.log('problem with request: ' + e.message);
    });

    // write data to request body
    reqi.write(JSON.stringify({"confirmed":true}));
    reqi.end();
});*/

var blk_stream = "test23";
var blk_publisher = "1DkQGLaSibCC8jsryRGYGQmLg1S6S155dMfdaw";
// var blk_publisher = "1RMqjEp4SRBZ3gZjz1ss9E1jpNibpupVuoP3Po";

//var blk_txid = "e7d50db8d5cdfa8491e894c0907c5ea07265cd6e4c3fdab9d150b27bd6543259";
/*var al = [{event_type:"Birth",verifier:"Department of Public Health",data:{name:"Rishav Patil",father_name:"Akhil Patil", mother_name:"Ananya Patil", dob: "15-02-1998", date_registration: "12-12-2019", gender: "Male", nationality: "Indian"}},{event_type:"ID",verifier:"passport",data:{name:"Rishav Patil",number:"M1320965", mother_name:"Ananya Patil", dob: "15-02-1998", gender: "Male", nationality: "Indian"}}, {event_type:"ID",verifier:"aadhar",data:{name:"Rishav Patil",number:"509127043618", father_name:"Akhil Patil", dob: "15-02-1998", gender: "Male"}}, {event_type:"Education",verifier:"PES University",data:{edu_name:"Rishav Patil", edu_degree:"B.Tech", edu_college:"PES University", edu_end: "15-02-1998", edu_gender: "Male", edu_sid:"01FB15ECS047", edu_city:"Bangalore", edu_join:"15-02-2012"}}, {event_type:"Employment",verifier:"Microsoft",data:{emp_name:"Rishav Patil", emp_role:"Manager", emp_company:"McAfee", emp_join: "15-02-1998", emp_gender: "Male", emp_eid:"20007635", emp_city:"Bangalore"}}, {event_type:"Marriage",verifier:"Municipal Corporation of Marriage",data:{marriage_partner1_name:"Rishav Patil", marriage_partner2_name:"Ameena Patil", marriage_pastor:"Alok Kumar", marriage_date: "15-02-1998", marriage_city:"Bangalore"}}, {event_type:"Migration",verifier:"Ministry of Petroleum and Natural Gas",data:{address_name:"Rishav Patil", address_change_date: "15-02-1998", address_old: {
                    "address_hno" : "Marigold-125",
                    "address_street" : "IAF main road",
                    "address_city" : "Bangalore",
                    "address_pin" : "560013",
                    "address_state" : "Karnataka"
                }, address_new: {
                    "address_hno" : "Block C-125",
                    "address_street" : "3rd main road",
                    "address_city" : "Hyderabad",
                    "address_pin" : "560123",
                    "address_state" : "Telangana"
                }}}];*/
router.get('/', function(req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.get('/view', function(req, res, next) {
    //res.render("view", { title: 'Express' });
    GetRPC();
    
    let multichain = require("multichain-node")({
      port: 4768,
      host: '127.0.0.1',
      user: rpcVar.rpcuser,
      pass: rpcVar.rpcpassword
    });
    //console.log(rpcVar.rpcpassword.split('\r'));
    multichain.subscribe({stream: blk_stream},(erri, txi) => {	});
    multichain.listStreamItems({stream: blk_stream, count: 9999},(err, tx)=>{
	// multichain.listStreamPublisherItems({stream: blk_stream, address: blk_publisher, count: 9999},(err, tx)=>{
        if(err){
            console.log(err);
        }
		if(tx){
			var temp_txid=-1;
			var events_array=[];
			var obj={};
			for (var i = tx.length - 1; i >= 0; i--) {
          if(i==tx.length-1){
            console.log(tx[i])
          }

					if(events_array.length==8){
						break;
					}

					if(temp_txid!=tx[i].txid){
						//new event
						if(obj!==undefined && i!==tx.length-1 && obj!=={}){
							events_array.push(obj)
						}
						temp_txid = tx[i].txid;
						let TXidentity=tx[i].data.json.meta.identity;
						obj={"event_type":tx[i].data.json.meta.eventType, "verifier":tx[i].data.json.meta.verifier, "data":{}}
						obj["data"][TXidentity]=tx[i].data.json[TXidentity];


					}
					else{
						let TXidentity=tx[i].data.json.meta.identity;
						obj["data"][TXidentity]=tx[i].data.json[TXidentity];
						if(i==0){
							events_array.push(obj)
						}

					}

			}
		}
		// res.render("view", { title: 'Express' , birth_event: birth_dict, id_event: id_dict});
		console.log(events_array);
		res.render("view", { title: 'Express' ,event_arrays:JSON.stringify(events_array)});
		//res.send(events_array);


	});

  });


router.get('/services', function(req, res, next) {
  res.render('services', { title: 'Express' });
});


var formFields;
router.get ('/idf', function (req,res,next) {
    // if(req.url==='/test'){
    //     console.log("11")
    // }
    console.log("11");
    if(formFields===undefined && req.url==='/idf'){
        console.log("Ss");
        res.render('idf', {title: ""});
    }
    else {
        if(formFields!==undefined) {
            let url_parts = url.parse(formFields, true);
            let query = url_parts.query;
            // formFields=query.key
            console.log(query);
            res.render('idf',{title:query.key});
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


router.get('/main', function(req, res, next) {
  res.render('main', { title: 'Express' });
});

module.exports = router;
