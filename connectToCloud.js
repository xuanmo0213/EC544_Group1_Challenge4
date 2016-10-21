
var Particle = require('particle-api-js');
var particle = new Particle();
var token;
var mysql = require("mysql");
var moment = require("moment");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  port: "3306",
  database: "challenge4"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    console.log(err);
    return;
  }
  console.log('Connection established');
});


var date_time = moment().format('YYYY-MM-DD H:mm:ss');
var init_time = date_time;
var old_date = date_time;

particle.login({username: 'ec544group1@gmail.com', password: 'group1544'}).then(   
    function(data){       
        setInterval(function() {
            var sum=0;
            var count=0;
            var avg=0.00;
            var avg_data={};
            //console.log('date_time:  ' + date_time);
            if (date_time != init_time){		
                var times = date_time.toLocaleString().split(',');
                var year = date_time.getFullYear(), 
                    month = date_time.getMonth()+1,
                    day = date_time.getDate(),
                    hour = date_time.getHours(),
                    minute = date_time.getMinutes(),
                    second = date_time.getSeconds()-2;
                var time = year+"-"+month+"-"+day+" " + hour+":"+minute+":"+second;
                con.query("SELECT*FROM sensor_data WHERE time>='"+time+"'" ,function (error, results) {
                    if (error){
                        console.log('fail to fetch data.'+time);
                        console.log(error);
                    }
                    else if (results.length>0){
                        //console.log(results);
                        for (var row in results)
                        {
                            //console.log(row);
                            sum+=results[row].temp;
                            count+=1;
                        }
                        avg=sum/count;
                        avg_data["sensor_id"]="avg";
                        avg_data["time"]=time; 
                        avg_data["temp"]=avg;
                        console.log('The avg temp is '+avg+time+"for " + count + " sensors");
                        con.query('INSERT INTO sensor_data SET ?',avg_data, function(err, result)
                        {
                            if (error){
                                console.log('fail to insert data!');
                            }
                        });
                    }
                //con.release();
                });
            }
			//date_time = moment().format('YYYY-MM-DD H:mm:ss');
            console.log('loop end');
        }, 2000);

        //console.log('API call completed on promise resolve: ', data.body.access_token);
        token = data.body.access_token;
        var deviceID = new Array();
        deviceID[0] = '330034001347353236343033';//sensor_1
        deviceID[1] = '2b0017001547353236343033';//sensor_2
        deviceID[2] = '2f003c000b47353235303037';//sensor_3
        deviceID[3] = '240028001847353236343033';//sensor_4
        
        particle.getEventStream({ deviceId: deviceID[0], name: 'sensor_1', auth: token }).then(function(stream) {
            stream.on('event', function(data1) {
                output('sensor1', data1);                
                //console.log('parseTime!!   ' , actual_time);
                date_time = insert_individual_data('sensor_1', data1.data, data1.published_at,init_time);
                
          });
        });
        particle.getEventStream({ deviceId: deviceID[1], name: 'sensor_2', auth: token }).then(function(stream) {
            stream.on('event', function(data1) {
                output('sensor2', data1);
                insert_individual_data('sensor_2', data1.data, date_time,init_time);
          });
        });
        particle.getEventStream({ deviceId: deviceID[2], name: 'sensor_3', auth: token }).then(function(stream) {
            stream.on('event', function(data1) {
                output('sensor3', data1);
                insert_individual_data('sensor_3', data1.data, date_time,init_time);
          });
        });
        particle.getEventStream({ deviceId: deviceID[3], name: 'sensor_4', auth: token }).then(function(stream) {
            stream.on('event', function(data1) {
                output('sensor4', data1);
                insert_individual_data('sensor_4', data1.data, date_time,init_time);             
          });
        });
        
    }
);

function output( name ,data1){
    console.log(name +' :  temp : ' + data1.data + " time: " + date_time);
}

function insert_individual_data(key, value, date_time, init_time){
    //console.log('get here2222');
    var actual_time = new Date(Date.parse(date_time));
    var obj = {};
    obj["sensor_id"] = key;
    obj["temp"] = value;
    if (date_time !== init_time)
    {
        //console.log('start insert data');
        //console.log(obj);
        obj["time"] = actual_time;
		//console.log('INSERT INTO sensor_data SET ?'+obj);
        con.query('INSERT INTO sensor_data SET ?', obj, function(error, result)
        {
            if (error){
                console.log('fail to insert new sensor data!');
            }
        });
		//con.release();
        return actual_time;
    }
}
