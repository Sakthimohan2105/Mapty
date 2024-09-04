'use strict';



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class workouts {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){

    this.coords = coords; //[lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
    
    
}

    _setDescribtion(){
        // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this._setDescribtion = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}



class Running extends workouts{
    type = 'running'
    constructor(coords,distance,duration,cadence){
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPase();
        this._setDescribtion();
    }

    calcPase(){
        // min/km
        this.pase = this.distance / this.duration;
        return this.pase;
    }
}

class Cycling extends workouts{
    type = 'cycling';
    constructor(coords,distance,duration,elevationChange){
        super(coords, distance, duration)
        this.elevationChange = elevationChange;
        this.calcSpeed();
        this._setDescribtion();
    }

    calcSpeed(){
        // km/hr
        this.speed = this.duration / this.distance / 60;
        return this.speed;
    }
}
// const run1 = new Running([39 ,- 12], 5.2, 34, 178)
// const cycling1 = new Cycling([39 ,- 12], 27, 95, 508)
// console.log(run1, cycling1);


class App {

    #map;
    #mapEvent;
    #workouts = [];

    constructor(){
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }



    _getPosition(){
        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition( this ._loadMap.bind(this), function(){
            alert('Could not get your position')
        })}


    _loadMap(position){
        
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            console.log(`https://www.google.co.in/maps/@${latitude}, ${longitude}`);
    
            const coords = [latitude, longitude]
             this.#map = L.map('map').setView(coords, 13);
    
            L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
        // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this))
    
    
    }


    _showForm(mapE){
        this.#mapEvent = mapE
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(){
            
        // Clearing all inputs in the form
        
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => form.style.display = 'grid', 1000);

    }


    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
                inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }


    _newWorkout(e){

        const validInputs = (...input) => input.every(inp => Number.isFinite(inp))
        const allPositive = (...input) => input.every(inp => inp > 0);
        e.preventDefault();


        // Get data from form
         const type = inputType.value;
         const distance =  +inputDistance.value;
         const duration =  +inputDuration.value;
         const {lat, lng} = this.#mapEvent.latlng;
         let workout;


         // if workout running, create running object
         if(type === 'running'){
            const cadence = +inputCadence.value;

            // Check if data is valid

            if(
            
              !validInputs(distance, duration, cadence) 
                || !allPositive(distance,duration,cadence)
            )
            return alert('Inputs have to be positive numbers!');

             workout = new Running([lat, lng], duration, distance,cadence);
            
         }



         // if workout is cycling, create cycling object
         if(type === 'cycling'){
            const elevation = +inputElevation.value;

            if(
                
                  !validInputs(distance, duration, elevation) || !allPositive   (distance,   duration)
                )
                return alert('Inputs have to be positive numbers!');

                 workout = new Cycling([lat, lng], duration, distance, elevation);
            }
         

         // Add new objects to workout array
                this.#workouts.push(workout);
                

         // Render workout on maps
            this._renderWorkoutMarker(workout);

            // Render workout on List
            this._renderWorkout(workout);

            // Hide form + clear input fields
            this._hideForm();

            } 

            _renderWorkoutMarker(workout) {
                L.marker(workout.coords)
                .addTo(this.#map)
                .bindPopup(
                    L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className:  `${workout.type}-popup`,
                })
            

            )
            
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout._setDescribtion}`)
            .openPopup();
        }


            _renderWorkout(workout)
            {
               let html = ` <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout._setDescribtion}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}/span>
            <span class="workout__unit">min</span>
          </div>`;

          if(workout.type === 'running')
            
            html  += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pase.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        ;

        if(workout.type === 'cycling')

            html+= `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationChange}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`


            form.insertAdjacentHTML('afterend', html);
            
          }
        }
            
               
           
            
            // Display marker
            
               
            



const app = new App();


// const form = document.querySelectorAll('.form')
// const containerWorkouts = document.querySelector('.workouts')
// const inputType = document.querySelector('.form__input--type')
// const inputDistance = document.querySelector('.form__input--distance')
// const inputDuration = document.querySelector('.form__input--duration')
// const inputCadence = document.querySelector('.form__input--cadance')
// const inputElevation = document.querySelector('.form__input--elevation')

// class workouts{
//     date = new Date()
//     id = (Date.now() + '').slice(-10);

//     constructor(coords, distance, duration){
//         this.coords = coords,
//         this.distance = distance,
//         this.duration = duration
//     }



// _setDescribtion(){
//     const month = ['January','February', 'march', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

//     this._setDescribtion = `${this.type[0].toUpperCase()} ${this.type[1].slice(1)} on ${month[this.date.getMonth]} ${this.date.getDate}`
// }
// }


// class running extends workouts{
//     type = 'running'
//     constructor(coords, distance, duration, cadance){
//         super(coords, distance, duration)
//         this.cadance = cadance;
//         this.calcPase()
//         this._setDescribtion()

//     }

//     calcPase(){
//         // Min/Km
//         this.pase = this.distance/this.duration
//         return this.speed
//     }
    
// }


// class cycling extends workouts{
//     constructor(coords, distance, duration, elevationChange){
//         super(coords, distance, duration)
//         this.elevationChange = elevationChange
//         this.calcSpeed()
//         this._setDescribtion()
//     }

//     calcSpeed(){
//         //km/hr
//         this.speed = this.duration/this.distance/60
//         return this.speed
//     }
// }

// class App{
//     #map;
//     #mapEvent;
//     #workouts = [];

//     constructor(){
//                 this._getPosition();
//                 form.addEventListener('submit', this._newWorkout.bind(this));
//                 inputType.addEventListener('change', this._toggleElevation);
//             }


//     _getPosition(){
//         if(navigator.geolocation)
//             navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
//         alert('Could not find your location')
//             })
//     }

//     _loadMap(position){
//         const{lattitude} = position.coords;
//         const{longtitude} = position.coords;
//         console.log(`https://www.google.co.in/maps/@${lattitude},${longtitude}`)

//         const coords = [lattitude,longtitude]
//         this.#map = L.map('map').setView(coords, 13)

        
//              L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//          }).addTo(this.#map);
         
//          // Handling click on maps
//          this.#map.on('click', this._showForm.bind(this));
//     }


//     _showForm(mapE){
//         this.#mapEvent = mapE
//         form.classlist.remove('hidden')
//         inputDistance.focus();
//     }


//     _hideForm(){
//         inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

//         form.style.display = none;
//         form.classlist.remove('hidden')
//         setTimeout(() => form.style.display = 'grid', 1000)
//     }

//     _toggleElevation(){
//         inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//         inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

//     }

//     _newWorkout(e){
//         const validInputs = (...input) => input.every(inp => Number.isFinite(inp))
//         const allPositive = (...input) => input.every(inp => inp > 0);
//         e.preventDefault()

//         // Get data from form
//         const type = inputType.value;
//         const distance = +inputDistance.value;
//         const duration = +inputDuration.value;
//         const {coords} = this.#mapEvent.ltnlng;
//         let workout;

//         // if the workout is running, create running object
//         if(type === 'running'){
//             const cadance = +cadance.value;

//             // if the value is invalid
//             if(!validInputs(distance,duration,cadance) || !allPositive(distance,duration,cadance))
//                 return alert('Inputs must be in positive values')


//                 workout = new running([lat,lng], distance, duration, cadance);
//         }


//         if(type === 'cycling'){
//             const elevation = +elevation.value;

//             // if the value is invalid
//             if(!validInputs(distance,duration,elevation) || !allPositive(distance,duration,elevation))
//                 return alert('Inputs must be in positive values')


//                 workout = new running([lat,lng], distance, duration, elevation);
//         }

//        // Add new object to workout array
//        this.#workouts.push(workout)

//        // Render workout on list
//        this._renderWorkout(workout);

//        // Render workout on map
//        this._renderWorkoutMarker(workout)

//        // Hide form + clear input
//        this._hideForm(workout)
//     }
       
 
//              _renderWorkoutMarker(workout) {
//                     L.marker(workout.coords)
//                     .addTo(this.#map)
//                     .bindPopup(
//                         L.popup({
//                         maxWidth: 250,
//                         minWidth: 100,
//                         autoClose: false,
//                         closeOnClick: false,
//                         className:  `${workout.type}-popup`,
//                     })
                
    
//                 )
                
//                 .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout._setDescribtion}`)
//                 .openPopup();
//             }
    
//             _renderWorkout(workout)
//             {
//                let html = ` <li class="workout workout--${workout.type}" data-id="${workout.id}">
//           <h2 class="workout__title">${workout._setDescribtion}</h2>
//           <div class="workout__details">
//             <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
//             <span class="workout__value">${workout.distance}</span>
//             <span class="workout__unit">km</span>
//           </div>
//           <div class="workout__details">
//             <span class="workout__icon">⏱</span>
//             <span class="workout__value">${workout.duration}/span>
//             <span class="workout__unit">min</span>
//           </div>`;
            

            
//           if(workout.type === 'running')
            
//             html  += `<div class="workout__details">
//             <span class="workout__icon">⚡️</span>
//             <span class="workout__value">${workout.pase.toFixed(1)}</span>
//             <span class="workout__unit">min/km</span>
//           </div>
//           <div class="workout__details">
//             <span class="workout__icon">🦶🏼</span>
//             <span class="workout__value">${workout.cadence}</span>
//             <span class="workout__unit">spm</span>
//           </div>
//         </li>`
//         ;

//         if(workout.type === 'cycling')

//             html+= `
//             <div class="workout__details">
//             <span class="workout__icon">⚡️</span>
//             <span class="workout__value">${workout.speed.toFixed(1)}</span>
//             <span class="workout__unit">km/h</span>
//           </div>
//           <div class="workout__details">
//             <span class="workout__icon">⛰</span>
//             <span class="workout__value">${workout.elevationChange}</span>
//             <span class="workout__unit">m</span>
//           </div>
//         </li>`


//             form.insertAdjacentHTML('afterend', html);
            
//           }
// }

// const app = new App();