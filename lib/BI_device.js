/****************
v1 made by nam jongheon ,2017 9.25 

Note

BI_device.js client application as BI_blockserver.js

If it connect to blockserver, it generate transaction which types are operation, access, monitor, remove
Each device's operations are allowed from server , allow or deny
transaction can be inserted or deleted from webPage

****************/


const transaction = require('./BI_Tx')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const _ = require('lodash')
const io = require('socket.io-client')
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
const emitter = new Emitter();

const config = require('./deviceConfig.json')

/*******************
validate constant

validate = allow

*******************/
const val= {
   validate : 1,
   deny : 2
}

/*******************
device constructor
inital properties
start initConnection, CommandServer,  Emitter
*******************/
class deviceI{

  /*****************
  *@constructor deviceI
  *****************/
  constructor(){
      const self = this



      this.devId = config.Id
      this.socket
      this.oplist = []
      this.opresult = []

      self.addOp(1,1,'1')
      self.addOp(2,2,'2')

      self._initConnection()
      self._initCommandServer()
      self._initEmitter()
  }

  /**********************
   Event section

   description

   when socket recive from server , call operation evnet

   sequence

   1. event recive operation
   2. check server response
   3. operation start

  *@method _initEmitter
  **********************/

  _initEmitter(){
     const self = this

     emitter.on('operation', function(data){
        if(data.result == 1){
          console.log('[device] operation valid : ' + data.txType + ' _ ' + data.trgORop)
          var index = _.findIndex(self.oplist, function(op){
            return (op.txType == data.txType) && (op.trgORop == data.trgORop)
          });
          self.opresult[index] = "allow"
          self.operation(data.txType, data.trgORop)
          //response.render('device3.html', {oplist : self.oplist, devId : self.devId, opresult : self.opresult})
        }else{
          console.log('[device][operation deny] :' + data.txType + ' _ ' + data.trgORop )
          var index = _.findIndex(self.oplist, function(op){
            return (op.txType == data.txType) && (op.trgORop == data.trgORop)
          });
          console.log(index)
          self.opresult[index] = "deny"
        }
     })
  }

  /**********************

  add this device's operation

  *@method operation
  *@param {Integer} txType
  *@param {String} trgORop
  **********************/
  operation(txType, trgORop){
      console.log('operation')
  }

  /**********************
   Connection section

   description

   connection to server ( server ip can change in File deviceConfig.json)
   register validateClinet socket event (this event call from server)
   call operation evnet

  *@method _initConnection
  **********************/
  _initConnection(){
      const self = this

      self.socket = io.connect(config.server)
      self.socket.on('validateClient', function(data){
          emitter.emit('operation', data)
      })
  }

  /***********************
   CommandServer section

   description

   recieve user command from http web server

   registerd path

   1. '/' main page
   2. '/sendTx' send Transcation (It must call through href registed opreation)
   3. '/add' add operation(=Transcation)
   4. '/delete' delete operation(=Transcation)

   *@method _initCommandServer
  **********************/
  _initCommandServer(){
    const self = this

    app.get('/', function(req, res){
       res.render('device.html', {oplist : self.oplist , devId : self.devId, opresult : self.opresult})
    })

    app.get('/sendTx', function(req, res){

       var data = {
         devId : self.devId,
         txType : req.query.txType,
         trgORop : req.query.trgORop,
         content : req.query.content
       }


       var newTx = new transaction(data)

       console.log('[device][createTx] _devId :' +newTx.devId + '_txType : ' + newTx.txType + '_trgORop : ' + newTx.trgORop +'_Content :' + newTx.content)

       self.socket.emit('sendTx', newTx)

       res.render('device.html', {oplist : self.oplist, devId : self.devId, opresult : self.opresult})
    })

    app.get('/add', function(req, res){
       console.log(req.query.txType)
       self.addOp(req.query.txType, req.query.trgORop, req.query.content)
       res.render('device.html', {oplist : self.oplist , devId : self.devId, opresult : self.opresult})
    })

    app.get('/delete', function(req, res){
      console.log(req.query.index)
      self.deleteOp(req.query.index)
       res.render('device.html', {oplist : self.oplist , devId : self.devId, opresult : self.opresult})
    })

    app.set('views', __dirname + '/../views');
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.static('public'));

    app.listen(config.webSocket , function(){
      console.log('[app][device] start')
    })
  }

  /********************
  function section

  addOp - add operation
  deleteOp - delete operation

  ********************/

  /*******************
  add operation(=Transcation) txType, trgORop(=target OR operation) , content are needed
  *@method addOp
  *@param {Integer} txType
  *@param {String} trgORop
  *@param {String} content
  ********************/
  addOp(txType, trgORop, content){
    const self = this

     var op = {
       txType : txType,
       trgORop : trgORop,
       content : content
     }

     self.oplist.push(op)
     self.opresult.push('Not activate')
  }

  /********************
  *delete Operation(=Transcation) from index
  *@method deleteOp
  *@param {Intger} index
  ********************/
  deleteOp(index){
    const self = this

    //console.log('delete : '  + index )
    self.oplist.splice(index,1)
    self.opresult.splice(index,1)
  }

}

module.exports = deviceI;
