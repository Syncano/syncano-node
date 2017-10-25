/* eslint-disable */
import connect from 'syncano-server'

const s = connect() // Connect to Syncano
const city = ARGS.text  // Getting a city name from the input argument
const sender = ARGS.sender // ID of the user who sent the message

// Getting forecast by calling "openweathermap" socket and "get-three-hours-forecast" endpoint
s.endpoint.post('openweathermap/get-three-hours-forecast', {city: ARGS.text})
  .then(resp => resp.json())
  .then(forecast => {

    // Creating response message
    const response = ['In next 3 hours you can expect:']
    let rain = false
    forecast.forEach(prediction => {
       response.push(`${prediction.hour} - ${prediction.forecast}`)
       if (prediction.forecast.toLowerCase() == 'rain') {
         rain = true
       }
    })

    // Let's check if it is going to rain and add proper message to response
    if (rain) {
      response.push(`It looks like you need an umbrella in ${ARGS.text}!`)
    } else {
      response.push(`You don\'t need an umbrella in ${ARGS.text}!`)
    }

    // This event will be caught by "messenger-bot" Socket
    // Content of the text argument will be sent as a replay
    s.event.emit('m-bot-msg-send', {text: response.join('\n'), sender})
  })
  .catch(err => {
    // This event will be caught by "messenger-bot" Socket
    // Content of the text argument (in this case error message) will be sent as a replay
    s.event.emit('m-bot-msg-send', {text: err.message, sender})
  })
