import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        })
    }

    async connect() {
        try{
            await this.#dbClient.connect();
            console.log('DB connection established');

        } catch(error){
            console.error('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect() {
        try{
            await this.#dbClient.end();
            console.log('DB connection was closed');
            

        } catch(error){
            console.error('Unable to disconnect to DB: ', error);
            return Promise.reject(error);
            
        }
    }
    async

    async addMovie({
        movieID,
        name,
        duration
    } = {
        movieID: null,
        name: '',
        duration: 0
    }){
        if(!movieID || !name || !duration){
            const errMsg = `Add movie error: wrong params (id: ${movieID}, name: ${name}, duration:${duration})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into movie (id, name, duration) values ($1, $2, $3);',
                [movieID, name, duration]

            );

        } catch (error) {
            console.error('Unable add movie, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async getScreenings(){
        try {
            const screenings = await this.#dbClient.query(
                'select screening.id, movie.name as movie_name, hall.name as hall_name, duration, capacity, scr_date_time, bookings from screening\
                join movie on (screening.movie_id = movie.id) \
                join hall on (screening.hall_id = hall.id)\
                order by scr_date_time;'   //changed

            );
            return screenings.rows;

        } catch (error) {
            console.error('Unable get list of screenings, error: ', error);  //changed
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    async getBookings(){
        try {
            const bookings = await this.#dbClient.query(
                'select booking.id, booking.customer_name as customer_name, movie.name as movie_name, hall.name as hall_name, scr_date_time, tickets_number \
                from booking join (\
                    select booking_id, movie_id, hall_id, scr_date_time from screening, UNNEST(bookings) as booking_id\
                ) as expanded_screenings on (booking.id = expanded_screenings.booking_id) \
                join movie on (expanded_screenings.movie_id = movie.id) \
                join hall on (hall.id = expanded_screenings.hall_id);'// order by screening_id, position;' //changed
            );
            //console.log('bookings::: ', bookings);
            return bookings.rows;

        } catch (error) {
            console.error('Unable get bookings, error: ', error);    //changed
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    //подтягиваем фильмы из бд READY
    async getMovies(){
        try {
            const movies = await this.#dbClient.query(
                'select * from movie order by name;' //changed

            );
            //console.log('bookings::: ', bookings);
            return movies.rows;

        } catch (error) {
            console.error('Unable get movies, error: ', error);    //changed
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    //подтягиваем залы из бд READY
    async getHalls(){
        try {
            const halls = await this.#dbClient.query(
                'select * from hall order by name;' //changed

            );
            //console.log('bookings::: ', bookings);
            return halls.rows;

        } catch (error) {
            console.error('Unable get halls, error: ', error);    //changed
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }


    //подтягиваем вместимость зала из бд
    async getLimits({screeningID} = {screeningID: null}){

        if (!screeningID){
                const errMsg = `Get limits error: wrong params (id: ${screeningID})`;
                console.error(errMsg);
                return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            
            const limits = await this.#dbClient.query(
                'select capacity from screening\
                join hall on hall.id = screening.hall_id where screening.id = $1;', 
                [screeningID]
            );
            //console.log('bookings::: ', bookings);
            return limits.rows;

        } catch (error) {
            console.error('Unable get limits, error: ', error);    //changed
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }


    async addScreening({  // changed
        screeningID,
        hallID,
        movieID,
        datetime,
        position = -1
    } = {
        screeningID: null,
        hallID: null,
        movieID: null,
        datetime:null,
        position: -1
    }){
        if(!hallID ||!movieID ||!screeningID){// || position < 0){
            const errMsg = `Add screening error: wrong params (id: ${screeningID}, hallID: ${hallID}, movieID: ${movieID},  position: ${position})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        const screenings = await this.#dbClient.query(
            'select screening.id, movie.name as movie_name, hall.name as hall_name, duration, capacity, scr_date_time, bookings from screening\
            join movie on (screening.movie_id = movie.id) \
            join hall on (screening.hall_id = hall.id)\
            ;'   //changed

        );

        try {
            await this.#dbClient.query(
                'insert into screening (id, movie_id, scr_date_time, hall_id) values ($1, $2, $3, $4);',
                [screeningID, movieID, datetime, hallID]

            );

        } catch (error) {
            console.error('Unable add screening, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async updateScreening({  // changed
        screeningID,
        hallID,
        datetime
        //position = -1
    } = {
        screeningID: null,
        hallID: null,
        datetime: null
        //position: -1
    }){
        if(!hallID ||!datetime ||!screeningID ){
            const errMsg = `Update screening error: wrong params (id: ${screeningID}, hallID: ${hallID}, datetime: ${datetime}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'update screening set hall_id = $1, scr_date_time = $2 where id = $3;',
                [ hallID, datetime, screeningID]

            );

        } catch (error) {
            console.error('Unable update screening, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }


    async deleteScreening({ //changed
        screeningID
    } = {
        screeningID: null
    }){
        if(!screeningID){
            const errMsg = `Delete load error: wrong params (id: ${screeningID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        //console.log(screeningID);
        try {// брони уже удалены в цикле в App
            await this.#dbClient.query(
                'delete from screening where id = $1;',
                [screeningID]
            );


        } catch (error) {
            console.error('Unable delete screening, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }


    async addLoad({
        bookingID, name, ticketsNumber, position=-1, screeningID
    } = {
        bookingID: null,
        name: '',
        ticketsNumber: 1,
        position:-1,
        screeningID: null
    }){
        if(!screeningID || !name || !ticketsNumber || position < 0 || !bookingID){
            const errMsg = `Add load error: wrong params (id: ${bookingID}, name: ${name}, ticketsNumber: ${ticketsNumber}, position: ${position}, screeningId: ${screeningID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into booking (id, customer_name, tickets_number, position) values ($1, $2, $3, $4);',
                [bookingID, name, ticketsNumber, position]

            );
            await this.#dbClient.query(
                'update screening set bookings = array_append(bookings, $1) where id = $2;',
                [bookingID, screeningID]

            );

        } catch (error) {
            console.error('Unable add load, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async updateLoad({
        bookingID, name, ticketsNumber, position
    } = {
        bookingID: null,
        name: '',
        ticketsNumber: 1,
        position:-1,
    }){
        console.log("updating by: ", name, ticketsNumber, position);
        if((!name && !ticketsNumber && position < 0) || !bookingID){
            const errMsg = `Update load error: wrong params (id: ${bookingID}, name: ${name}, position: ${position})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        let query = null;
        const queryParams = [];
        if(name && ticketsNumber && position >= 0){// если изменяется то всё
            query = 'update booking set customer_name = $1, tickets_number = $2, position = $3 where id = $4;';
            queryParams.push(name, ticketsNumber, position, bookingID);
        } else if(name && ticketsNumber){
            
            query = 'update booking set customer_name = $1, tickets_number = $2 where id = $3;';
            queryParams.push(name, ticketsNumber, bookingID);
            
        } else if(name) {
            query = 'update booking set name=$1, position = $2 where id = $3;';
            queryParams.push(name, position, bookingID);
        } else {
            query = 'update booking set position = $1 where id = $2;';
            queryParams.push(position, bookingID);
        }

        try {
            await this.#dbClient.query(
                query,
                queryParams
            );

        } catch (error) {
            console.error('Unable update load, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async deleteLoad({ //changed
        bookingID
    } = {
        bookingID: null
    }){
        if(!bookingID){
            const errMsg = `Delete booking error: wrong params (id: ${bookingID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log("bookingID", bookingID);
        try {
            await this.#dbClient.query(
                'delete from booking where id = $1;',
                [bookingID]

            );
            await this.#dbClient.query(
                'update screening set bookings = array_remove(bookings, $1);',
                [bookingID]

            );

        } catch (error) {
            console.error('Unable delete load, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }


    async moveLoad({  
        bookingID,
        srcScreeningID,
        destScreeningID
    } = {
        bookingID: null,
        srcScreeningID: null,
        destScreeningID: null
    }){
        if(!bookingID || !srcScreeningID || !destScreeningID){
            const errMsg = `Move booking error: wrong params (id: ${bookingID}, srcID: ${srcScreeningID}, destScreeningID: ${destScreeningID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        /*const movie1 = await this.#dbClient.query(
            'select movie_id from screening \
            where id = $1;',
            [srcScreeningID]
        );
        movie1 = movie1.rows.movie_id;
        const movie2 = await this.#dbClient.query(
            'select movie_id from screening \
            where id = $1;',
            [destScreeningID]
        );
        movie2 = movie2.rows.movie_id;
        console.log("movie1, movie2", movie1, movie2);
        if(movie1 != movie2){
            const errMsg = `Move booking error: not the same movies (id: ${bookingID}, srcID: ${srcScreeningID}, destScreeningID: ${destScreeningID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }*/

        try {

            /*await this.#dbClient.query(
                'update booking set screening_id = $1 where id = $2;',
                [destScreeningID, bookingID]
            );*/
            
            await this.#dbClient.query(
                'update screening set bookings = array_append(bookings,$1) where id = $2;',
                [bookingID, destScreeningID]
            );
            await this.#dbClient.query(
                'update screening set bookings = array_remove(bookings, $1) where id = $2;',
                [bookingID, srcScreeningID]
            );

        } catch (error) {
            console.error('Unable move booking, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }
};