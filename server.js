const mongo = require('mongodb').MongoClient;//MongoDB Node.js Driver
const io = require('socket.io').listen(4000).sockets;//run socket.io in port 4000

mongo.connect('mongodb://localhost:27017/mongochat', { useNewUrlParser: true }, (err, client) => {
    if (err) { throw err }
    console.log("mongodb connected...")

    //connect to Socket.io
    io.on('connection', (socket) => {
        let chats = client.db('mongochat').collection('chats');

        // set up a status emit function,everytime server wants to send message to the client , we use emit
        sendStatus = (status) => {
            socket.emit("status", status);
        }

        chats.find().limit(100).sort({ _id: 1 }).toArray((err, result) => {
            if (err) { throw err }
            console.log(result);
            socket.emit('output', result);
        })
        //handle input message using socket.on
        socket.on('input', (data) => {
            
            var name = data.name;
            var message = data.message;
           data=[data];// curent data is object, has to transfer it to the array. so that they can loop thru
       
            if (name == "" || message == "") {
                sendStatus("Please enter name and message")
            } else {
                chats.insertOne({ name: name, message: message }, () => {
                    //emit the output to the client
                    //console.log(data);
                    io.emit('output', data)// sending to all connected clients
                    sendStatus({
                        message: "Message Sent",
                        clear: true
                    })
                })
            }


        })

    //handle the clear button
     socket.on("clear",(data)=>{
         chats.remove({},()=>{
         socket.emit("cleard");
         })
     })

    })



})