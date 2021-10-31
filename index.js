const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT||5000;
const ObjectId = require('mongodb').ObjectId;

//middelwere
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5cmdn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel-agency');
        const eventCollection = database.collection('events');
        const ordersCollection = database.collection('orders');


        //Get Products
        app.get('/events',async (req,res)=>{
            const cursor = eventCollection.find({});
            const count =await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let events;
            if (page)
            {
                events = await cursor.skip(page*size).limit(size).toArray();
            }
            else {
                events =await cursor.toArray();
            }


            res.send({
                count,
                events});
        })


        //use post to Get Order By Email
        app.post('/orders/byEmail',async (req,res)=>{
            const email = req.body
            const query = {email:email.email}

            const orders = await ordersCollection.find(query).toArray();
            res.json(orders)
        })


        //Add Event
        app.post('/addEvent',async (req,res)=>{
            const data = req.body;
            const order = await eventCollection.insertOne(data);
            res.json(order);
        })

        //Delete Events
        app.delete('/events/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await eventCollection.deleteOne(query)
            res.send(result);
        })


        //Get Order
        app.get('/orders',async (req,res)=>{
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        //Add orders
        app.post('/orders',async (req,res)=>{
            const data = req.body;
            const order = await ordersCollection.insertOne(data);
            res.json(order);
        })

        //Updata Order status
        app.put('/status/:id',async (req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const data = req.body;
            const updateDoc = {
                $set: {
                    status: data.status
                },
            };
            console.log(data);
            const order = await ordersCollection.updateOne(query,updateDoc);
            res.json(order);
        })

        //Delete Order
        app.delete('/orders/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await ordersCollection.deleteOne(query)
            res.send(result);
        })
    }
    finally
    {

    }
}

run().catch(console.dir)

app.get('/', (req,res)=>{

    res.send("Server start");
})
app.listen(port,()=>{
    console.log('port listening at ',port)
})