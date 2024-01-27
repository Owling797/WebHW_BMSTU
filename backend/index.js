import dotenv from 'dotenv';
import express, { response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import DB from './db/client.js';
import { timeStamp } from 'console';

const __filename = fileURLToPath(import.meta.url); //полный путь к файлу
const __dirname = path.dirname(__filename);  //полный путь к директории


console.log(__filename, __dirname);

dotenv.config(
    {
        path: './backend/.env'
    }
);

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

console.log(appHost, appPort);
console.log(process.env);

const app = express();
const db = new DB();

// logginn middleware
app.use('*', (req, res, next) => {
    
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString()
    );
    next(); // следующий обработчик
});

// middleware for static app files
app.use('/', express.static(path.resolve(__dirname, '../dist')));

// get movie READY ???
app.get('/movies', async (req, res) => {    //changed
    try {
        const [dbDests] = await Promise.all([db.getMovies()]);
        
        const movies = dbDests.map(({id, name, duration}) => ({
            movieID: id, name, duration
        })); 

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ movies });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting movie error: ${err.error.message || err.error}`
        });
    }
});

// добавление фильма
app.use('/movies', express.json())
app.post('/movies', async (req, res) => {     //changed
    try{
        const { movieID, name, duration } = req.body;
        await db.addMovie({ movieID, name, duration }); ///////////////////
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
     
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add destination error: ${err.error.message || err.error}`
        });
    }
});


// get halls READY
app.get('/halls', async (req, res) => {    //changed
    try {
        const [dbFerrys] = await Promise.all([db.getHalls()]);
        
        const halls = dbFerrys.map(({id, name, capacity}) => ({
            hallID: id, name, capacity
        })); 

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ halls });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting halls error: ${err.error.message || err.error}`
        });
    }
});


// get limits
app.get('/limit/:screeningID', async (req, res) => {    //changed
    try {
        const {screeningID} = req.params;
        const [dbLimits] = await Promise.all([db.getLimits({ screeningID })]);
        
        const limits = dbLimits.map(({capacity}) => ({
            capacity: capacity
        }));
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ limits });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting limits error: ${err.error.message || err.error}`
        });
    }
});



// get screenings and bookings
app.get('/screenings', async (req, res) => {    //changed
    try {
        console.log("!!!111!!!");
        const [dbScreenings, dbLoads] = await Promise.all([db.getScreenings(),db.getBookings()]);

        
        const bookings = dbLoads.map(({id, customer_name, movie_name, scr_date_time, tickets_number}) => ({
            bookingID: id, customer_name: customer_name, movie_name: movie_name, scr_date_time: scr_date_time, tickets_number:tickets_number
        })); 
        
        const screenings = dbScreenings.map(screening => ({
            screeningID: screening.id,
            movie_name: screening.movie_name,
            hall_name: screening.hall_name,
            duration: screening.duration,
            capacity: screening.capacity,
            scr_date_time: screening.scr_date_time,
            position: screening.position,
            bookings: bookings.filter(load => screening.bookings.indexOf(load.bookingID) !== -1)
        }));

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ screenings });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting screenings and bookings error: ${err.error.message || err.error}`
        });
    }
});
// body parsing middleware
app.use('/screenings', express.json())
app.post('/screenings', async (req, res) => {     //changed
    try{
        const { screeningID, hallID, movieID, datetime, position } = req.body;
        await db.addScreening({ screeningID, hallID, movieID,datetime, position });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
     
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add screening error: ${err.error.message || err.error}`
        });
    }
});

app.delete('/screenings/:screeningID', async (req, res) => {           //changed
    try{
        const { screeningID } = req.params;
        await db.deleteScreening({ screeningID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete screening error: ${err.error.message || err.error}`
        });
    }
});


app.get('/bookings', async (req, res) => {    //changed
    try {
        const dbBookings = await Promise.all(db.getBookings());

        const bookings = dbBookings.map(({id, customer_name, movie_name, scr_date_time, tickets_number}) => ({
            bookingID: id, customer_name: customer_name, movie_name: movie_name, scr_date_time: scr_date_time, tickets_number:tickets_number
        })); 
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ bookings });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting bookings error: ${err.error.message || err.error}`
        });
    }
});
// body parsing middleware
app.use('/bookings', express.json())
// add load
app.post('/bookings', async (req, res) => {              //changed
    try{
        const {bookingID, name, ticketsNumber, position, screeningID} = req.body;
        await db.addLoad({ bookingID, name, ticketsNumber, position, screeningID});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add booking error: ${err.error.message || err.error}`
        });
    }
});

// body parsing middleware
app.use('/bookings/:bookingID', express.json());
// edit load params
app.patch('/bookings/:bookingID', async (req, res) => {  // пока будет меняться только название и позиция
    console.log("index, params:", req.body);
    try{
        const {bookingID} = req.params;
        const { name, ticketsNumber, position} = req.body;
        
        await db.updateLoad({ bookingID, name, ticketsNumber, position});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update booking params error: ${err.error.message || err.error}`
        });
    }
});

// edit several tasks position
app.patch('/bookings', async ( req, res) => {   //тут меняются только позиции
    try{
        const { reorderedLoads } = req.body;
        await Promise.all(reorderedLoads.map(({ bookingID, position}) => db.updateLoad({ bookingID,  position})));
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update bookings error: ${err.error.message || err.error}`
        });
    }
});

// delete task
app.delete('/bookings/:bookingID', async (req, res) => {           //changed
    try{
        const { bookingID } = req.params;
        await db.deleteLoad({ bookingID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete load error: ${err.error.message || err.error}`
        });
    }
});

// edit screening params
app.patch('/screenings/:screeningID', async (req, res) => {  //changed
    try{
        const {screeningID} = req.params;
        const { hallID, datetime} = req.body;
        await db.updateScreening({ screeningID, hallID, datetime});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update screening params error: ${err.error.message || err.error}`
        });
    }
});



// move bookings between screenings
app.patch('/screenings', async (req, res) => {               //changed
    try{
        const {bookingID, srcScreeningID, destScreeningID } = req.body;
        await db.moveLoad({bookingID, srcScreeningID, destScreeningID});

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Move load error: ${err.error.message || err.error}`
        });
    }
})




const server = app.listen(Number(appPort), appHost, async () => {             //changed

    try{
        await db.connect()
    } catch(error){
        console.log('Load manager app shut down');
        process.exit(100);
    }

    console.log(`Load manager app started at host http://${appHost}:${appPort}`);

    console.log(await db.getScreenings());
    // await db.moveTask({
    //     taskID: '8384e864-d359-4c38-b3a8-1e0dd929cbd0',
    //     srcTasklistID: 'bdde8b73-e5d3-4972-91cc-fab71967f55c',
    //     destTasklistID: 'e550ac89-c93c-4944-aee5-9f4d65e9b7c7'
    // });
    // console.log(await db.getTaskLists());
    // console.log(await db.getTasks());
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closed HYYP server')
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});