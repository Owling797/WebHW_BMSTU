import Load from './Load';
import AppModel from '../model/AppModel';
//import Math;

export default class Screening {
  #bookings = []; // cards
  #screeningID = null;
  #screeningHall = '';
  #ScreeningMovie = '';
  #screeningDateTime = '';
  #screeningDuration = 0;
  #screeningPosition = -1;
  #screeningCurrentFullness = 0; // увеличивается при добавлении брони
  #screeningHallLimits = 0; // равен вместимости зала

  constructor({
    screeningID = null,
    hall,
    movie,
    dateTime,
    position,
    hallLimits,
    duration,
    onDropLoadInScreening,
    addNotification
  }) {
    console.log("typeof movie", typeof movie);
    console.log("typeof this.#ScreeningMovie",typeof this.#ScreeningMovie);
    this.#screeningHall = String(hall);
    this.#ScreeningMovie = String(movie);
    this.#screeningDateTime = String(dateTime);
    console.log('constr ', movie, this.#ScreeningMovie );
    console.log('constr dateTime', dateTime, this.#screeningDateTime );
    this.#screeningID = screeningID || crypto.randomUUID();
    this.#screeningPosition = position;
    this.#screeningHallLimits = hallLimits;
    this.#screeningDuration = duration;
    console.log('screening_position', this.#screeningPosition );
    this.onDropLoadInScreening = onDropLoadInScreening;
    this.addNotification = addNotification
  }

  get screeningID() { return this.#screeningID; }

  get screeningHall() { return this.#screeningHall; }

  get ScreeningMovie() { return this.#ScreeningMovie; }
  
  get screeningDateTime() { return this.#screeningDateTime; }

  get screeningHallLimits() { return this.#screeningHallLimits; }

  get screeningDuration() { return this.#screeningDuration; }
  
  get screeningCurrentFullness() { return this.#screeningCurrentFullness; }

  get screeningPosition() { return this.#screeningPosition; }

  get bookings() { return this.#bookings; }

 updateLimits =  async () => {
    this.#screeningHallLimits = await AppModel.getLimits({
    screeningID: this.#screeningID
  });

  let result=0;
  for (let load of this.#bookings) {
    console.log(load);
    result += load.bookingTicketsNumber;
  };
  this.#screeningCurrentFullness = result;
}

  pushLoad = ({ load }) => this.#bookings.push(load);

  getLoadById = ({ bookingID }) => this.#bookings.find(load => load.bookingID === bookingID);

  deleteLoad = ({ bookingID }) => {
    const deleteLoadIndex = this.#bookings.findIndex(load => load.bookingID === bookingID);

    if (deleteLoadIndex === -1) return;

    const [deletedLoad] = this.#bookings.splice(deleteLoadIndex, 1);
    this.#screeningCurrentFullness -= deletedLoad.bookingTicketsNumber;
    return deletedLoad;
  };

  getCurrentLoads  = () => { // суммарная загрузка сеанса (бронирование мест)
    let result = 0;

    console.log('start');
    //const bookings = await AppModel.getScreenings();
    //console.log(this.#bookings);
    //console.log(String(this.#bookings[0]));
    for (let load of this.#bookings) {
      console.log(load);
      result += Number(load.bookingTicketsNumber);
      console.log('+=', load.bookingTicketsNumber);
    };
    console.log('result', result);
    return result;
  };

  reorderLoads = async () => {
    //console.log(document.querySelector(`[id="${this.#screeningID}"] .screening__loads-list`));
    const orderedLoadsIDs = Array.from(
      document.querySelector(`[id="${this.#screeningID}"] .screening__loads-list`).children,
      elem => elem.getAttribute('id')
    );


    const reorderedLoadsInfo = [];

    orderedLoadsIDs.forEach((bookingID, position) => {
      const load = this.#bookings.find(load => load.bookingID === bookingID);
      if(load.loadPosition !== position){
        load.loadPosition = position;
        reorderedLoadsInfo.push({
          bookingID,
          position
        });
      }
    });

    if(reorderedLoadsInfo.length > 0){
      try{
        await AppModel.updateLoads({
          reorderedLoads: reorderedLoadsInfo
        });
      } catch(err){
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);
      }

    }

    //console.log(this.#bookings);
  };

  appendNewLoad = async ({ name, ticketsNumber }) => {
    
    console.log("appendNewLoad", name, ticketsNumber)
    let screeningLimits;
    try{
    //получение количества мест из бд:
      console.log(this.#screeningID)
      screeningLimits = await AppModel.getLimits({
        screeningID: this.#screeningID
      });
      console.log(screeningLimits)
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});    
      console.error(err);
    }
    // текущее количество купленных мест
    const CurrentLoads = this.getCurrentLoads();
    console.log("CurrentLoads", CurrentLoads);
    const newFullness = CurrentLoads + ticketsNumber;

    const screenings = await AppModel.getScreenings();
    console.log("BOOKINGS", this.#bookings);
    try{
      for(let load of this.bookings){
        if (load.bookingCustomerName == name){
          console.log("LOAD", load);
          console.log("bookingTicketsNumber, ticketsNumber", load.bookingTicketsNumber, ticketsNumber);
          const newTicketsNumber = Number(load.bookingTicketsNumber) + Number(ticketsNumber);
          const updateLoadResult = await AppModel.updateLoad({ bookingID: load.bookingID, name: name, ticketsNumber : newTicketsNumber});

          //console.log(updateLoadResult);
          //this.addNotification({ text: updateLoadResult.message, type: 'success'});
        
          this.addNotification({ text: 'Билеты добавлены к существующему заказу', type: 'success'});
          location.reload();
          return;
        }
      }
    }catch( err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }
    /*if (newFullness > screeningLimits){
      this.addNotification({ text: 'Не достаточно мест в кинозале', type: 'error'});
    

    else{*/
      try {
      const bookingID = crypto.randomUUID();
      const addLoadResult = await AppModel.addLoad({
        bookingID: bookingID,
        name: name,
        movie: this.#ScreeningMovie,
        time: this.screeningDateTime,
        hall: this.#screeningHall,
        ticketsNumber: ticketsNumber,
        position: this.#bookings.length,
        screeningID: this.#screeningID
      });

      this.addNewLoadLocal({
        bookingID: bookingID,
        name: name,
        movie: this.#ScreeningMovie,
        time: this.screeningDateTime,
        hall: this.#screeningHall,
        ticketsNumber: ticketsNumber,
        position: this.#bookings.length
      });

      this.updateLimits();

      this.addNotification({ text: addLoadResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});    
      console.error(err);
    }
    //}
  };


  addNewLoadLocal = ({bookingID = null, name, movie, time, hall, ticketsNumber, position}) => {
    console.log("addNewLoadLocal!!!", bookingID, name, movie, time, hall, ticketsNumber, position);
    const newLoad = new Load({
      bookingID,
      name,
      movie,
      time,
      hall,
      ticketsNumber,
      position,

    });
    this.#bookings.push(newLoad);

    const newLoadElement = newLoad.render();
    document.querySelector(`[id="${this.#screeningID}"] .screening__loads-list`)
      .appendChild(newLoadElement);
  };

  // rendering 
  render() {
    console.log("RENDER SCREENING");
    const liElement = document.createElement('li');
    liElement.classList.add(
      'screenings-list__item',
      'screening'
    );
    liElement.setAttribute('id', this.#screeningID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcScreeningID', this.#screeningID)
    );
    liElement.addEventListener('drop', this.onDropLoadInScreening);

    const screeningHeader = document.createElement('li');
    screeningHeader.classList.add('screening__header');

    const h2Element_name = document.createElement('h2');
    h2Element_name.classList.add('screening__name');
    h2Element_name.innerHTML = "Сеанс:";
    screeningHeader.appendChild(h2Element_name);

    // кнопки
    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('load__controls');

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('load__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('screening__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      localStorage.setItem('editScreeningID', this.#screeningID);
      document.getElementById('modal-edit-scr').showModal();
    });
    lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('screening__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => {
      localStorage.setItem('deleteScreeningID', this.#screeningID);
      const deleteScreeningModal = document.getElementById('modal-delete-screening');
      deleteScreeningModal.querySelector('.app-modal__question').innerHTML = `Сеанс '${this.#screeningID}' и все брони на него, будут удалены. Продолжить?`;
      deleteScreeningModal.showModal();
      });

    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    screeningHeader.appendChild(controlsDiv);
    liElement.appendChild(screeningHeader);

    /*const h2Element_id = document.createElement('h2');
    h2Element_id.classList.add('screening__info');
    h2Element_id.innerHTML = "id: "+this.#screeningID;
    liElement.appendChild(h2Element_id);*/

    const h2Element_dest = document.createElement('h2');
    h2Element_dest.classList.add('screening__info');
    h2Element_dest.innerHTML = "Фильм: " + this.#ScreeningMovie; 
    liElement.appendChild(h2Element_dest);

    const h2Element_duration = document.createElement('h2');
    h2Element_duration.classList.add('screening__info');
    const hours = parseInt((Number(this.#screeningDuration) / 60))  ;
    const minutes = Number(this.#screeningDuration) % 60;
    h2Element_duration.innerHTML = "Длительность: " + String(hours) + " ч " + minutes + " мин"; 
    liElement.appendChild(h2Element_duration);

    const h2Element_ferry = document.createElement('h2');
    h2Element_ferry.classList.add('screening__info');
    h2Element_ferry.innerHTML = "Кинозал: " + this.#screeningHall; 
    liElement.appendChild(h2Element_ferry);
    
    const h3Element_ferry = document.createElement('h2');
    h3Element_ferry.classList.add('screening__info');
    let scrDate = new Date(this.#screeningDateTime);
    h3Element_ferry.innerHTML = "Начало: " + String(scrDate).slice(0, 15) + ", "+String(scrDate).slice(16, 21); 
    liElement.appendChild(h3Element_ferry);
    console.log("this.#screeningDateTime", this.#screeningDateTime, typeof(this.#screeningDateTime));
    console.log("scrDate", scrDate, typeof(scrDate));


    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('screening__loads-list');
    liElement.appendChild(innerUlElement);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('screening__add-load-btn');
    button.innerHTML = '&#10010; Добавить бронь';
    button.addEventListener('click', () => {
      localStorage.setItem('addBookingScrID', this.#screeningID);
      document.getElementById('modal-add-booking').showModal();
    });
    liElement.appendChild(button);

    const h2Element_car = document.createElement('h2');
    h2Element_car.classList.add('screening__info');
    console.log("limits: ",this.#screeningHallLimits)
    h2Element_car.innerHTML = "Максимум: "+ this.#screeningHallLimits[0].capacity + " билетов"; 
    liElement.appendChild(h2Element_car);


    const adderElement = document.querySelector('.scr-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);
  }
};
