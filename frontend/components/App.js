import Screening from './Screening.js';
import AppModel from '../model/AppModel.js';

var MAX_TICKETS = 40;
var SERVICE_PAUSE = 10;

export default class App {
  #screenings = [];

  //getScreeningById = ({ screeningID }) => this.#screenings.find(screening => screening.screeningID === screeningID);


  deleteScreeningFromScreenings = ({ screeningID }) => {
    const deleteScreeningIndex = this.#screenings.findIndex(screening => screening.screeningID === screeningID);

    if (deleteScreeningIndex === -1) return;

    const [deletedScreening] = this.#screenings.splice(deleteScreeningIndex, 1);

    return deletedScreening;
  };


  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.scr-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.scr-adder__btn')
        .style.display = 'inherit';
    }
  };

  onInputKeydown = async (event) => {  //создаем новый пункт 
    if (event.key !== 'Enter') return;

    if (event.target.value) {

      const movieID = crypto.randomUUID();

      try{
        const addDestResult = await AppModel.addDests({
          movieID,
          name: event.target.value,
          //position: this.#screenings.length
        });

        // const  newScreening = new Screening({
        //   screeningID,
        //   //name: event.target.value,
        //   position: this.#screenings.length,
        //   onDropLoadInScreening: this.onDropLoadInScreening,
        //   addNotification: this.addNotification
  
        // });

        // this.#screenings.push(newScreening);
        // newScreening.render();

        
        this.addNotification({ text: addDestResult.message, type: 'success'});
        location.reload();

      } catch (err) {
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);

      };

      
    }

    event.target.style.display = 'none';
    event.target.value = '';

    //document.querySelector('#movie-adder')
    //  .style.display = 'inherit';
  };

  onDropLoadInScreening = async (evt) => {/////////////// еще не переделано
    evt.stopPropagation();

    const destScreeningElement = evt.currentTarget;
    destScreeningElement.classList.remove('screening_droppable');

    const movedLoadID = localStorage.getItem('movedLoadID');
    const srcScreeningID = localStorage.getItem('srcScreeningID');
    const destScreeningID = destScreeningElement.getAttribute('id');

    console.log("src, movie : ", srcScreeningID, destScreeningID)

    localStorage.setItem('movedLoadID', '');
    localStorage.setItem('srcScreeningID', '');

    if (!destScreeningElement.querySelector(`[id="${movedLoadID}"]`)) return;

    const srcScreening = this.#screenings.find(screening => screening.screeningID === srcScreeningID);
    const destScreening = this.#screenings.find(screening => screening.screeningID === destScreeningID);

    const load = srcScreening.bookings.find(load => load.bookingID === movedLoadID);
    
    try {

      console.log('destination ', srcScreening.ScreeningMovie, destScreening.ScreeningMovie)
      
      if (srcScreening.ScreeningMovie !== destScreening.ScreeningMovie){
        this.addNotification({ text: 'Не совпадают фильмы сеансов', type: 'error'});
        location.reload();

        return;
      }

      let screeningLimits;
      
      //получение количества мест из бд:
      //console.log(this.#screeningID)
      screeningLimits = await AppModel.getLimits({
        screeningID: destScreeningID
      });
      screeningLimits = screeningLimits[0];
      console.log(screeningLimits)

      const CurrentLoads = destScreening.getCurrentLoads();
        
        if (srcScreeningID !== destScreeningID) {
          
          await AppModel.moveLoad({
            bookingID: movedLoadID,
            srcScreeningID,
            destScreeningID
          });
          console.log('movie ', destScreening);
          console.log('src ', srcScreening);
          const movedLoad = srcScreening.deleteLoad({ bookingID: movedLoadID });
          destScreening.pushLoad({ load: movedLoad });
    
          await srcScreening.reorderLoads();
          // console.log('hqwjqjwq');
        }
    
        await destScreening.reorderLoads();
        // console.log('hqwjqjwq');

        
        this.addNotification({ text: `Load (ID: ${movedLoadID}) move between screenings`, type: 'success'});
      }
      
    catch(err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }
    // const destLoadsIDs = Array.from(
    //   destScreeningElement.querySelector('.Screening__loads-list').children,
    //   elem => elem.getAttribute('id')
    // );

    // destLoadsIDs.forEach((bookingID, position) => {
    //   destScreening.getLoadById({ bookingID }).loadPosition = position;
    // });

    // console.log(this.#Screenings);
  };


  // удаление сеанса
  deleteScreening = async ({ screeningID }) => {

    //удаляем
    try{
      let delLoad = null;
      //удалим все задачи?
      //console.log("screeningID  ", screeningID);
      //console.log(this.#screenings);
      let curScreening = this.#screenings.find(screening => screening.screeningID === screeningID);
      //console.log("cur_screening ", curScreening);
      for (let load of curScreening.bookings) {
        const bookingID = load.bookingID;
        delLoad = await AppModel.deleteLoad({ bookingID });
        curScreening.deleteLoad({ bookingID });
        document.getElementById(bookingID).remove();
      }


      const deleteScreeningResult = await AppModel.deleteScreening({ screeningID });
      this.deleteScreeningFromScreenings(screeningID);
      document.getElementById(screeningID).remove();

      this.addNotification({ text: deleteScreeningResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };
 
  
  editScreening = async ({ screeningID, newDatetime, newHallID}) => {
    // let fLoad = null;
    // for (let screening of this.#screenings) {
    //   fLoad = screening.getLoadById({ bookingID });
    //   if (fLoad) break;
    // }

    //const curLoadName = fLoad.bookingCustomerName;
    //if (!newLoadName || newLoadName === curLoadName) return;

    try{
      const updateScreeningResult = await AppModel.updateScreening({ screeningID, datetime: newDatetime, hallID : newHallID});

      //fLoad.loadText = newLoadName;
      //document.querySelector(`[id="${bookingID}"] span.load__name`).innerHTML = newLoadName;
      location.reload(); //надо изменить потом чтоб нормально было 

      //console.log(updateScreeningResult);
      this.addNotification({ text: updateScreeningResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }
  };

  editLoad = async ({ bookingID, newLoadName, newLoadNumber }) => { //// еще не переделано
    console.log("editLoad", bookingID, newLoadName, newLoadNumber);
    let fLoad = null;
    for (let screening of this.#screenings) {
      fLoad = screening.getLoadById({ bookingID });
      if (fLoad) break;
    }

    //const curLoadName = fLoad.bookingCustomerName;
    //if (!newLoadName || newLoadName === curLoadName) return;
    try{
      const updateLoadResult = await AppModel.updateLoad({ bookingID, name: newLoadName, ticketsNumber : newLoadNumber});

      fLoad.loadText = newLoadName;
      document.querySelector(`[id="${bookingID}"] span.load__name`).innerHTML = newLoadName;
      document.querySelector(`[id="${bookingID}"] span.load__number`).innerHTML = newLoadNumber;

      //console.log(updateLoadResult);
      this.addNotification({ text: updateLoadResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }

    
  };

  


  deleteLoad = async ({ bookingID }) => {
    let fLoad = null;
    let fScreening = null;
    //ищем в каком сеансе
    for (let screening of this.#screenings) {
      fScreening = screening;
      fLoad = screening.getLoadById({ bookingID });
      if (fLoad) break;
    }

    //удаляем
    try{
      const deleteLoadResult = await AppModel.deleteLoad({ bookingID });

      fScreening.deleteLoad({ bookingID });
      await fScreening.updateLimits();
      document.getElementById(bookingID).remove();

      this.addNotification({ text: deleteLoadResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };

  //новый модал для редактирования сеанса
  async initEditScreeningModal() {
    const EditScreeningModal = document.getElementById('modal-edit-scr');
    //список фильмов
    /*const movies = await AppModel.getMovies();
    const label_element = document.getElementById('label-for-select-movie_ed');
    //console.log(movies);

    const selectElement = document.createElement('select');
    const id_select = crypto.randomUUID();
    localStorage.setItem('select_movie_edit_id', id_select);
    selectElement.setAttribute('id', id_select);
    selectElement.setAttribute('class', 'app-modal__input');
    for(let movie of movies){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = movie['name'];
      optionElement.setAttribute('id', movie['movieID']);
      
      optionElement.setAttribute('value', movie['name']);
      selectElement.appendChild(optionElement);

    }
    label_element.after(selectElement);
    */
    // список halls
    const halls = await AppModel.getHalls();
    const label_element_f = document.getElementById('label-for-select-hall_ed');
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!halls ",halls);

    const selectElementF = document.createElement('select');
    const id_select_f = crypto.randomUUID();
    localStorage.setItem('select_hall_edit_id', id_select_f);
    selectElementF.setAttribute('id', id_select_f);
    selectElementF.setAttribute('class', 'app-modal__input');
    for(let hall of halls){
      const optionElementF = document.createElement('option');
      optionElementF.innerHTML = hall['name'];
      optionElementF.setAttribute('id', hall['hallID']);
      optionElementF.setAttribute('value', hall['name']);

      selectElementF.appendChild(optionElementF);
      console.log("hall ",hall);
    }
    label_element_f.after(selectElementF);



    const cancelHandler = () => {
      EditScreeningModal.close();
      localStorage.setItem('editScreeningID', '');
      //createScreeningModal.querySelector('.app-modal__input').value = ''; //возможно надо будет чтото другое обнулить
    };

    const okHandler = async () =>  {
      console.log("okHandler edit");
      const screeningID = localStorage.getItem('editScreeningID');
      //const id_select_movie = localStorage.getItem('select_movie_edit_id');
      //const modalInputMovie = document.getElementById(id_select_movie);
      
      const id_select_hall = localStorage.getItem('select_hall_edit_id');
      const modalInputHall = document.getElementById(id_select_hall);

      //const movieID = String(modalInputMovie.options[modalInputMovie.selectedIndex].id);
      //const movieName = String(modalInputMovie.options[modalInputMovie.selectedIndex].value);
      //console.log("movieID ", movieID);

      const hallID = String(modalInputHall.options[modalInputHall.selectedIndex].id);
      const hallName = String(modalInputHall.options[modalInputHall.selectedIndex].value);
      //console.log("hallID ", hallID);

      const datetime = String(document.getElementById('time-adder-input_ed').value);
      const newdate = new Date(datetime);
      
      const movies = await AppModel.getMovies();
      const screenings = await AppModel.getScreenings();
      let movieName;
      for (let scr of screenings){
        if(screeningID == scr.screeningID){
          movieName = scr.movie_name
        }
      }
      console.log("movies", movies);
      let newDuration = 0;
      for(let movie of movies){
        if (movie.name == movieName){
          newDuration=movie.duration;
          console.log("FOUND NEW_DURATION", newDuration);
          break;
        }
      }
      const newEnd = new Date(datetime);
      newEnd.setMinutes(newEnd.getMinutes() + Number(newDuration))
      console.log("SCREENING CHECK", newdate, newEnd);

      for(let screening of this.#screenings){
        if(hallName == screening.screeningHall && screeningID != screening.screeningID){
          const curdate = new Date(String(screening.screeningDateTime));
          let curDuration = 0;
          for(let movie of movies){
            if (movie.name == screening.ScreeningMovie){
              curDuration=movie.duration;
              console.log("FOUND CUR_DURATION", curDuration);
              break;
            }
          }
          const curEnd = new Date(String(screening.screeningDateTime));
          curEnd.setMinutes(curEnd.getMinutes() + Number(screening.screeningDuration) + Number(SERVICE_PAUSE))
          console.log("TEST:", newdate, newEnd, " by cur: ", curdate, curEnd);
          if(newdate < curEnd && newEnd > curdate || curdate < newEnd && curEnd > newdate){ // пересечение дат
            console.log("OVERLAP");
            cancelHandler();
            this.addNotification({ text: "Time overlap in the hall: " + hallName, type: 'error'});
            //location.reload();
            return;
          }
        }
      
      }
      try{
        const editScreeningResult = this.editScreening({screeningID, newDatetime: datetime, newHallID: hallID});

        
        this.addNotification({ text: editScreeningResult.message, type: 'success'});

      } catch (err) {
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);

      }

      

      cancelHandler();
      }
      EditScreeningModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
      EditScreeningModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
      EditScreeningModal.addEventListener('close', cancelHandler);
    };

    

  //новый модал для создания сеанса
  async initCreateScreeningModal() {
    const createScreeningModal = document.getElementById('modal-create-scr');
    //список фильмов
    const movies = await AppModel.getMovies();
    console.log("DESTS");
    console.log(movies);
    const label_element = document.getElementById('label-for-select-movie');
    //console.log(movies);

    const selectElement = document.createElement('select');
    const id_select = crypto.randomUUID();
    localStorage.setItem('select_movie_id', id_select);
    selectElement.setAttribute('id', id_select);
    selectElement.setAttribute('class', 'app-modal__input');
    for(let movie of movies){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = movie['name'];
      optionElement.setAttribute('id', movie['movieID']);
      
      optionElement.setAttribute('value', movie['name']);
      selectElement.appendChild(optionElement);

      //console.log("movie", movie);

    }
    label_element.after(selectElement);
    
    // список halls
    const halls = await AppModel.getHalls();
    console.log("HALLS");
    console.log(halls);
    const label_element_f = document.getElementById('label-for-select-hall');
    //console.log("halls ",halls);

    const selectElementF = document.createElement('select');
    const id_select_f = crypto.randomUUID();
    localStorage.setItem('select_hall_id', id_select_f);
    selectElementF.setAttribute('id', id_select_f);
    selectElementF.setAttribute('class', 'app-modal__input');
    for(let hall of halls){
      const optionElementF = document.createElement('option');
      optionElementF.innerHTML = hall['name'];
      optionElementF.setAttribute('id', hall['hallID']);
      optionElementF.setAttribute('value', hall['name']);

      selectElementF.appendChild(optionElementF);
      console.log("hall", hall);
    }
    label_element_f.after(selectElementF);



    const cancelHandler = () => {
      createScreeningModal.close();
      //localStorage.setItem('addBookingScrID', '');
      //createScreeningModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = async () =>  {
      //const screeningID = localStorage.getItem('addBookingScrID');
      const id_select_movie = localStorage.getItem('select_movie_id');
      const modalInputMovie = document.getElementById(id_select_movie);
      
      const id_select_hall = localStorage.getItem('select_hall_id');
      const modalInputHall = document.getElementById(id_select_hall);

      const movieID = String(modalInputMovie.options[modalInputMovie.selectedIndex].id);
      const movieName = String(modalInputMovie.options[modalInputMovie.selectedIndex].value);
      console.log("movieID ", movieID);

      const hallID = String(modalInputHall.options[modalInputHall.selectedIndex].id);
      const hallName = String(modalInputHall.options[modalInputHall.selectedIndex].value);

      const datetime = String(document.getElementById('time-adder-input').value);
      console.log("hallID ", hallID);
      console.log("datetime ", datetime);

      if(movieID && hallID && datetime){
        //const screenings = await AppModel.getScreenings();
        //screenings = screenings.filter(load => screening.bookings.indexOf(load.bookingID) !== -1)
        //if(this.#screenings){
          const newdate = new Date(datetime);
          const movies = await AppModel.getMovies();
          console.log("movies", movies);
          let newDuration = 0;
          for(let movie of movies){
            if (movie.movieID == movieID){
              newDuration=movie.duration;
              console.log("FOUND NEW_DURATION", newDuration);
              break;
            }
          }
          const newEnd = new Date(datetime);
          newEnd.setMinutes(newEnd.getMinutes() + Number(newDuration))
          console.log("SCREENING CHECK", newdate, newEnd);
          if(this.#screenings.length >1){
          for(let screening of this.#screenings){
            if(hallName == screening.screeningHall){
              const curdate = new Date(String(screening.screeningDateTime));
              let curDuration = 0;
              for(let movie of movies){
                if (movie.name == screening.ScreeningMovie){
                  curDuration=movie.duration;
                  console.log("FOUND CUR_DURATION", curDuration);
                  break;
                }
              }
              const curEnd = new Date(String(screening.screeningDateTime));
              curEnd.setMinutes(curEnd.getMinutes() + Number(screening.screeningDuration) + Number(SERVICE_PAUSE))
              console.log("TEST:", newdate, newEnd, " by cur: ", curdate, curEnd);
              if(newdate < curEnd && newEnd > curdate || curdate < newEnd && curEnd > newdate){ // пересечение дат
                console.log("OVERLAP");
                cancelHandler();
                this.addNotification({ text: "Time overlap in the hall: " + hallName, type: 'error'});
                //location.reload();
                return;
              }
            }
          }
        }
        
        //}

        
        const screeningID = crypto.randomUUID();
        try{
          const addScreeningResult = await AppModel.addScreenings({
            screeningID,
            movieID,
            datetime,
            hallID,
            position: this.#screenings.length
          });
          const halls = await AppModel.getHalls();
          let hall_capacity;
          for (let hall of halls){
            if(hall.id == hallID){
              hall_capacity = hall.capacity;
              break;
            }
          }
          const  newScreening = new Screening({
            screeningID: screeningID,
            hall: hallName,
            movie: movieName,
            dateTime: datetime,
            //name: event.target.value,
            position: this.#screenings.length,
            hallLimits: hall_capacity,
            duration: newDuration,
            onDropLoadInScreening: this.onDropLoadInScreening,
            addNotification: this.addNotification
    
          });
          await newScreening.updateLimits();

          this.#screenings.push(newScreening);
          newScreening.render();

          
          this.addNotification({ text: addScreeningResult.message, type: 'success'});

        } catch (err) {
          this.addNotification({ text: err.message, type: 'error'});
          console.error(err);

        };

      }

      cancelHandler();
    };

    createScreeningModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    createScreeningModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    createScreeningModal.addEventListener('close', cancelHandler);
  }


  initAddLoadModal() {
    const addLoadModal = document.getElementById('modal-add-booking');
    const cancelHandler = () => {
      addLoadModal.close();
      localStorage.setItem('addBookingScrID', '');
      addLoadModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler  = async () =>  {
      const screeningID = localStorage.getItem('addBookingScrID');
      const modalInputName = addLoadModal.querySelector('#modal-add-booking-input-name');
      const modalInputNumber = addLoadModal.querySelector('#modal-add-booking-input-number')

      // проверка на доступность мест в зале
      const screenings = await AppModel.getScreenings();
      let screening;
      for (let scr of screenings){
        if (screeningID == scr.screeningID){
          screening = scr;
          console.log("Found screening (add)",screening);
          break;
        }
      }
      let currentSum=0;
      for (let booking of screening.bookings){
        currentSum += booking.tickets_number;
      }
      if(currentSum + Number(modalInputNumber.value) > screening.capacity){
        console.log("capacity exceeded", currentSum, " + " ,modalInputNumber.value, " > ",  screening.capacity);
        cancelHandler();
        this.addNotification({ text: "Hall capacity has been exceeded", type: 'error'});
        //location.reload();
        return;
      }

      // проверка на лимит для покупателя
      let clientSum=Number(modalInputNumber.value);
      for (let scr of screenings){
        for (let booking of scr.bookings){
          if (modalInputName.value == booking.customer_name){
            clientSum += Number(booking.tickets_number);
            break;
          }
        }
      }
      console.log("clientSum:", clientSum);
      if(clientSum > MAX_TICKETS){
        console.log("too many tickets for the person");
        cancelHandler();
        this.addNotification({ text: "Too many tickets for the person " + modalInputName.value, type: 'error'});
        //location.reload();
        return;
      }

      if(modalInputNumber.value > MAX_TICKETS){
        console.log("too many tickets for 1 person at a time");
        cancelHandler();
        this.addNotification({ text: "Too many tickets for 1 person at a time" + modalInputName.value, type: 'error'});
        //location.reload();
        return;
      }
      console.log(modalInputName.value, modalInputNumber.value);
      if(screeningID && modalInputName.value && modalInputNumber.value <= MAX_TICKETS){
        this.#screenings.find(screening => screening.screeningID === screeningID).appendNewLoad({ name: modalInputName.value,
                                                                                  ticketsNumber: modalInputNumber.value});

      }

      cancelHandler();
    };

    addLoadModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addLoadModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addLoadModal.addEventListener('close', cancelHandler);
  }

  initEditLoadModal() {
    const editLoadModal = document.getElementById('modal-edit-load');
    const cancelHandler = () => {
      editLoadModal.close();
      localStorage.setItem('editLoadID', '');
      editLoadModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = async () =>  {
      const bookingID = localStorage.getItem('editLoadID');
      // const modalInput = editLoadModal.querySelector('.app-modal__input');
      const modalInputName = editLoadModal.querySelector('#modal-add-booking-input-name-new');
      const modalInputNumber = editLoadModal.querySelector('#modal-add-booking-input-number-new');
      
      // проверка на доступность мест в зале
      const screenings = await AppModel.getScreenings();
      let screening;
      let flag=0;
      for (let scr of screenings){ // найти нужный screening, в котором есть этот booking
        console.log("scr:", scr);
        for(let b of scr.bookings){
          console.log("b.bookingID", b.bookingID, " bookingID ", bookingID);
          if (b.bookingID == bookingID){
            screening = scr;
            console.log("Found screening", screening);
            flag=1;
          }
          if(flag){break;}
        }
        if(flag){break;}
      }
      let currentSum=0;
      for (let booking of screening.bookings){
        if(booking.bookingID != bookingID){
          currentSum += booking.tickets_number;
        }
      }
      if(currentSum + Number(modalInputNumber.value) > screening.capacity){
        console.log("capacity exceeded");
        cancelHandler();
        this.addNotification({ text: "Hall capacity has been exceeded", type: 'error'});
        //location.reload();
        return;
      }

      // проверка на лимит для покупателя
      let clientSum=Number(modalInputNumber.value);
      for (let scr of screenings){
        for (let booking of scr.bookings){
          if (modalInputName.value == booking.customer_name){
            clientSum += Number(booking.tickets_number);
            break;
          }
        }
      }
      console.log("clientSum (edit):", clientSum);
      if(clientSum > MAX_TICKETS){
        console.log("too many tickets for the person");
        cancelHandler();
        this.addNotification({ text: "Too many tickets for the person " + modalInputName.value, type: 'error'});
        //location.reload();
        return;
      }
      if(modalInputNumber.value > MAX_TICKETS){
        console.log("too many tickets for 1 person at a time");
        cancelHandler();
        this.addNotification({ text: "Too many tickets for 1 person at a time", type: 'error'});
      }
      
      console.log("initEditLoadModal okHandler", bookingID, modalInputName.value,  modalInputNumber.value);
      if(bookingID && modalInputName.value && modalInputNumber.value <= MAX_TICKETS){
        this.editLoad({bookingID, newLoadName: modalInputName.value, newLoadNumber: modalInputNumber.value});
      }

      cancelHandler();
    };

    editLoadModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editLoadModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editLoadModal.addEventListener('close', cancelHandler);
  }

  initDeleteLoadModal() {
    const deleteLoadModal = document.getElementById('modal-delete-load');
    const cancelHandler = () => {
      deleteLoadModal.close();
      localStorage.setItem('deleteLoadID', '');
    };

    const okHandler = () => {
      const bookingID = localStorage.getItem('deleteLoadID');

      if(bookingID){
        this.deleteLoad({bookingID});

      }

      cancelHandler();
    };

    deleteLoadModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteLoadModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteLoadModal.addEventListener('close', cancelHandler);
  }


  initNotifications() {
    const notifications = document.getElementById('app-notifications');
    notifications.show();
  }


  addNotification = ({text, type}) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add(
      'notification',
      type === 'success' ? 'notification-success': 'notification-error'
    );

    notification.setAttribute('id', notificationID);
    notification.innerHTML = text;

    notifications.appendChild(notification);

    setTimeout(() => {document.getElementById(notificationID).remove();}, 5000)
  };


  initDeleteScreeningModal() {
    const deleteScreeningModal = document.getElementById('modal-delete-screening');
    const cancelHandler = () => {
      deleteScreeningModal.close();
      localStorage.setItem('deleteScreeningID', '');
    };

    const okHandler = () => {
      console.log("1111")
      const screeningID = localStorage.getItem('deleteScreeningID');

      if(screeningID){
        this.deleteScreening({screeningID});

      }

      cancelHandler();
    };

    deleteScreeningModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteScreeningModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteScreeningModal.addEventListener('close', cancelHandler);
  }


  initNotifications() {
    const notifications = document.getElementById('app-notifications');
    notifications.show();
  }


  addNotification = ({text, type}) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add(
      'notification',
      type === 'success' ? 'notification-success': 'notification-error'
    );

    notification.setAttribute('id', notificationID);
    notification.innerHTML = text;

    notifications.appendChild(notification);

    setTimeout(() => {document.getElementById(notificationID).remove();}, 5000)
  };

  async init() {
    console.log("INIT");
    /*document.querySelector('#movie-adder')
      .addEventListener(
        'click',
        (event) => {
          event.target.style.display = 'none';

          const input = document.querySelector('#movie-adder-input');
          input.style.display = 'inherit';
          input.focus();
        }
      );*/

    document.querySelector('.scr-adder__btn')
    .addEventListener('click', () => {
      //localStorage.setItem('addBookingScrID', this.#screeningID);
      document.getElementById('modal-create-scr').showModal();
    });

    document.addEventListener('keydown', this.onEscapeKeydown);

    /*document.querySelector('#movie-adder-input')
      .addEventListener('keydown', this.onInputKeydown);*/

    document.getElementById('theme-switch')
      .addEventListener('change', (evt) => {
        (evt.target.checked
          ? document.body.classList.add('dark-theme')
          : document.body.classList.remove('dark-theme'));
      });
    
    this.initCreateScreeningModal();
    console.log("start initEditScreeningModal");  
    this.initEditScreeningModal();
    console.log("end initEditScreeningModal");  
    this.initAddLoadModal();
    this.initEditLoadModal(); 
    this.initDeleteLoadModal();
    this.initDeleteScreeningModal();
    this.initNotifications();


    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();

      const draggedElement = document.querySelector('.load.load_selected');
      const draggedElementPrevList = draggedElement.closest('.screening');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.screening_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.screening') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('screening_droppable');

        if (curDroppable.matches('.screening')) {
          curDroppable.classList.add('screening_droppable');
        }
      }

      if (!curDroppable.matches('.screening') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.load')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.screening__loads-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.load')) {
        curDroppable.querySelector('.screening__loads-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.screening__loads-list').children.length) {
        curDroppable.querySelector('.screening__loads-list')
          .appendChild(draggedElement);
      }
    });


    try{
      const screenings = await AppModel.getScreenings();
      console.log('screening',screenings);
      for(const screening of screenings){
        console.log("scr_date_time",screening.scr_date_time);
        const screeningObj = new Screening({
          screeningID: screening.screeningID,
          hall: screening.hall_name,
          movie: screening.movie_name,
          dateTime: screening.scr_date_time,
          duration: screening.duration,
          position: screening.position,
          onDropLoadInScreening: this.onDropLoadInScreening,
          addNotification: this.addNotification
          // onEditLoad: this.onEditLoad,
        });

        await screeningObj.updateLimits();

        this.#screenings.push(screeningObj);
        console.log("this.#screenings", this.#screenings);
        screeningObj.render();
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log('bookings in screening',screening.bookings);
        console.log('typeof bookings in screening',typeof screening.screeningPosition);
        for( const load of screening.bookings){
          console.log("addNewLoadLocal load:", load);
          screeningObj.addNewLoadLocal({
            bookingID: load.bookingID,
            name: load.customer_name,
            movie: load.movie_name,
            time: load.scr_date_time,
            hall: screening.bookingHall,
            ticketsNumber: load.tickets_number,
            position: load.position
          });
        
        }
      }

    } catch( err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }
  }
};
