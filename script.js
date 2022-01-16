/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  let counter = document.getElementById('coffee_counter');
  counter.innerText = coffeeQty;
}

function clickCoffee(data) {
  data.coffee++;
  updateCoffeeView(data['coffee']);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  producers.forEach(producer => {
    if (coffeeCount >= (producer['price'] / 2)) {
      producer['unlocked'] = true
    }
  })
}

function getUnlockedProducers(data) {
  return data.producers.filter(producer => {
    return producer['unlocked'] === true
  })
}

function makeDisplayNameFromId(id) {
  return id
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title"><b>${displayName}</b></div>
    <button type="button" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div><b>Quantity:</b> ${producer.qty}</div>
    <div><b>Coffee/second:</b> ${producer.cps}</div>
    <div><b>Cost:</b> ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild)
  }
}

function renderProducers(data) {
  // Fetch the producer container div
  const producerContainer = document.querySelector('#producer_container')

  // Unlock eligible producers
  unlockProducers(data['producers'], data['coffee'])

  // Get unlocked producers
  const unlockedProducers = getUnlockedProducers(data)

  // Delete all child nodes before appending
  deleteAllChildNodes(producerContainer)

  // Append each unlocked producer to the producer container
  unlockedProducers.forEach(producer => {
    const newChild = makeProducerDiv(producer)
    producerContainer.appendChild(newChild)
  })

}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data['producers'].reduce((returnObj, producer) => {
    if (producer['id'] === producerId) {
      returnObj = producer
    }
    return returnObj
  }, {})
}


function canAffordProducer(data, producerId) {
  const producer = getProducerById(data, producerId)
  if (data['coffee'] >= producer['price']) {
    return true
  }
  return false
}

function updateCPSView(cps) {
  const coffeePerSecond = document.querySelector('#cps')
  coffeePerSecond.innerText = cps
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 125 / 100)
}

function attemptToBuyProducer(data, producerId) {
  if (canAffordProducer(data, producerId)) {
    // Get producer obj
    const producer = getProducerById(data, producerId)

    // Increment producer qty
    producer['qty']++

    // Decrement player's coffee by current producer price
    data['coffee'] -= producer['price']

    // Update producer price
    producer['price'] = updatePrice(producer['price'])

    // Update current coffee per second (data & HTML)
    data['totalCPS'] += producer['cps']
    updateCPSView(data['totalCPS'])

    // Return true if player can afford producer
    return true
  }
  // Return false if player cannot afford producer
  return false
}

function buyButtonClick(event, data) {
  if (event.target.tagName === 'BUTTON') {
    const producerId = event.target.id.split('_').slice(1).join('_')
    if (!canAffordProducer(data, producerId)) {
      window.alert('Not enough coffee!')
    }
    attemptToBuyProducer(data, producerId)
    renderProducers(data)
    updateCoffeeView(data['coffee'])
    updateCPSView(data['totalCPS'])
  }
}

function tick(data) {
  data['coffee'] += data['totalCPS']
  updateCoffeeView(data['coffee'])
  renderProducers(data)
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)
  let data;

  // On page load, check for stored data
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.data) {
      data = JSON.parse(localStorage.getItem('data'))
    } else {
      data = window.data
    }
  })

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });

  // Add event listener to 'reset game' button that clears the localStorage
  // object and reloads original data
  const resetGameBtn = document.querySelector('#reset-btn')
  resetGameBtn.addEventListener('click', () => {
    localStorage.clear()
    data = window.data
  })

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);

  // Save current data to window.localStorage every 1 second
  setInterval(() => {
    window.localStorage.setItem('data', JSON.stringify(data))
  }, 1000)
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}
