

export default class AppModel {

    static async getMovies() {            // changed
        try{
            const destResponse = await fetch('http://localhost:4322/movies'); // get запрос по-умолчанию
            const destBody = await destResponse.json();

            if(destResponse.status !== 200){
                return Promise.reject(destBody);
            }

            return destBody.movies;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addDests({movieID, name} = {        // changed
        movieID: null,
        name: ''
    }) {
        try{
            //console.log("logging ",screeningID, movieID, hallID, position);
            const addDestResponse = await fetch(
                'http://localhost:4322/movies',
                {
                    method: 'POST',
                    body: JSON.stringify({ movieID, name }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addDestResponse.status !== 200){
                const addDestBody = await addDestResponse.json();
                return Promise.reject(addDestBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dest '${movieID}' was successfully added to list of screenings`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getHalls() {            // READY changed
        try{
            const hallResponse = await fetch('http://localhost:4322/halls'); // get запрос по-умолчанию
            const hallBody = await hallResponse.json();

            if(hallResponse.status !== 200){
                return Promise.reject(hallBody);
            }

            return hallBody.halls;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getLimits({screeningID} = { screeningID: null}) { // текущая вместимость зала для этого сеанса
        try{
            const limitResponse = await fetch(`http://localhost:4322/limit/${screeningID}`); // get запрос по-умолчанию
            const limitBody = await limitResponse.json();

            if(limitResponse.status !== 200){
                return Promise.reject(limitBody);
            }

            return limitBody.limits;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getScreenings() {            // changed
        try{
            const screeningResponse = await fetch('http://localhost:4322/screenings'); // get запрос по-умолчанию
            const screeningBody = await screeningResponse.json();
            console.log("screeningBody", screeningBody);
            if(screeningResponse.status !== 200){
                return Promise.reject(screeningBody);
            }

            return screeningBody.screenings;
        } catch(err){
            console.log("err.message", err.message)
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getBookings() {            // changed
        try{
            const bookingResponse = await fetch('http://localhost:4322/bookings'); // get запрос по-умолчанию
            const bookingBody = await bookingResponse.json();
            console.log("bookingBody", bookingBody);
            if(bookingResponse.status !== 200){
                return Promise.reject(bookingBody);
            }

            return bookingBody.bookings;
        } catch(err){
            console.log("err.message", err.message)
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async addScreenings({screeningID, movieID, datetime, hallID, position = -1} = {        // changed
        screeningID: null,
        hallID: null,
        datetime:null,
        movieID: null,
        position: -1
    }) {
        try{
            console.log("logging ",screeningID, movieID, datetime, hallID, position);
            const addScreeningResponse = await fetch(
                'http://localhost:4322/screenings',
                {
                    method: 'POST',
                    body: JSON.stringify({screeningID, hallID, movieID,datetime, position}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addScreeningResponse.status !== 200){
                const addScreeningBody = await addScreeningResponse.json();
                return Promise.reject(addScreeningBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Screening '${screeningID}' was successfully added to list of screenings`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateScreening({screeningID, datetime, hallID} = {   
        screeningID: null,
        datetime: null,
        hallID: null
    }) {
        try{
            const updateScreeningResponse = await fetch(
                `http://localhost:4322/screenings/${screeningID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({hallID, datetime}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateScreeningResponse.status !== 200){
                const updateScreeningBody = await updateScreeningResponse.json();
                return Promise.reject(updateScreeningBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Screening '${screeningID}' was successfully updated`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async deleteScreening({screeningID } = {             //changed
        screeningID: null
    }) {
        try{
            const deleteScreeningResponse = await fetch(
                `http://localhost:4322/screenings/${screeningID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteScreeningResponse.status !== 200){
                const deleteScreeningBody = await deleteScreeningResponse.json();
                return Promise.reject(deleteScreeningBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Screening (ID = '${screeningID}') was successfully deleted`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

/////////////////////////////////////////////////////////////
    static async addLoad({bookingID, name, ticketsNumber, position, screeningID = -1} = {   //changed
        bookingID: null,
        name: '',
        ticketsNumber: 1,
        position: -1,
        screeningID: null
    }) {
        try{
            const addLoadResponse = await fetch(
                'http://localhost:4322/bookings',
                {
                    method: 'POST',
                    body: JSON.stringify({bookingID, name, ticketsNumber, position, screeningID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addLoadResponse.status !== 200){
                const addLoadBody = await addLoadResponse.json();
                return Promise.reject(addLoadBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Load '${name}' was successfully added to screening`
            };
        } catch(err){
            //console.log('here!!!');
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateLoad({bookingID, name, ticketsNumber, position = -1} = {   //пока что только название и позиция, добавить остальные штуки
        bookingID: null,
        name: '',
        ticketsNumber: 1,
        position: -1
    }) {
        try{
            console.log("updateLoad ", bookingID, name, ticketsNumber, position);
            const updateLoadResponse = await fetch(
                `http://localhost:4322/bookings/${bookingID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({name, ticketsNumber, position}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateLoadResponse.status !== 200){
                const updateLoadBody = await updateLoadResponse.json();
                return Promise.reject(updateLoadBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Load '${name}' was successfully updated`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateLoads({reorderedLoads = []} = {                  
        reorderedLoads: []                               //changed
    }) {
        try{
            const updateLoadsResponse = await fetch(
                `http://localhost:4322/bookings`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ reorderedLoads}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateLoadsResponse.status !== 200){
                const updateLoadsBody = await updateLoadsResponse.json();
                return Promise.reject(updateLoadsBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Load was successfully changed`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteLoad({bookingID } = {             //changed
        bookingID: null
    }) {
        try{
            console.log("deleteLoad ", bookingID);
            const deleteLoadResponse = await fetch(
                `http://localhost:4322/bookings/${bookingID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteLoadResponse.status !== 200){
                const deleteLoadBody = await deleteLoadResponse.json();
                return Promise.reject(deleteLoadBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Booking (ID = '${bookingID}') was successfully delete from Screening`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async moveLoad({bookingID, srcScreeningID, destScreeningID} = {  //changed
        bookingID: null,
        srcScreeningID: null,
        destScreeningID: null
    }) {
        try{
            const moveLoadResponse = await fetch(
                `http://localhost:4322/screenings`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({bookingID, srcScreeningID, destScreeningID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(moveLoadResponse.status !== 200){
                const moveLoadBody = await moveLoadResponse.json();
                return Promise.reject(moveLoadBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Load '${bookingID}}' was successfully moved from ${srcScreeningID} to ${destScreeningID} `
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
}