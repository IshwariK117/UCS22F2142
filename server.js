const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
let storedNumbers = [];

// Function to fetch numbers from the test server based on type
async function fetchNumbers(type) {
  const response = await axios.get(`http://20.244.56.144/test/${type}`);
  return response.data.numbers;
}

// Function to calculate average of numbers
function calculateAverage(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Function to format response object
function formatResponse(prevState, currState, fetchedNumbers, avg) {
  return {
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: fetchedNumbers,
    avg: avg.toFixed(2)
  };
}

// Handle incoming requests
app.get('/numbers/:id', async (req, res) => {
  const id = req.params.id;
  let numbers;
  try {
    switch(id) {
      case 'p':
        numbers = await fetchNumbers('primes');
        break;
      case 'f':
        numbers = await fetchNumbers('fibo');
        break;
      case 'e':
        numbers = await fetchNumbers('even');
        break;
      case 'r':
        numbers = await fetchNumbers('rand');
        break;
      default:
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    // Store fetched numbers, calculate average
    storedNumbers = [...storedNumbers, ...numbers];
    storedNumbers = [...new Set(storedNumbers)]; // Remove duplicates
    if (storedNumbers.length > WINDOW_SIZE) {
      storedNumbers = storedNumbers.slice(-WINDOW_SIZE); // Limit to window size
    }
    const avg = calculateAverage(storedNumbers);

    // Previous and current window states
    const prevState = storedNumbers.slice(-WINDOW_SIZE - numbers.length, -numbers.length);
    const currState = storedNumbers.slice(-WINDOW_SIZE);

    // Format response
    const response = formatResponse(prevState, currState, numbers, avg);
    res.json(response);
  } catch (error) {
    console.error('Error fetching numbers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
