#!/usr/bin/env node

const { exec } = require('child_process');

const duration = process.argv[2];

if (!duration) {
  console.error('Error: Please provide a duration argument');
  console.error('Usage: node sleeper.js <duration>');
  console.error('  - Whole numbers are treated as minutes (e.g., 30 = 30 minutes)');
  console.error('  - Floating numbers are treated as hours (e.g., 1.5 = 1.5 hours)');
  process.exit(1);
}

const parsedDuration = parseFloat(duration);

if (isNaN(parsedDuration) || parsedDuration < 0) {
  console.error('Error: Duration must be a positive number or zero');
  process.exit(1);
}

let milliseconds;
let durationDescription;

// Special case: if 0 is passed, sleep in 3 seconds
if (parsedDuration === 0) {
  milliseconds = 3000;
  durationDescription = '3 seconds';
} else {
  // Check if it's a whole number or has a decimal point
  const isWholeNumber = parsedDuration === Math.floor(parsedDuration);
  const isMinutes = isWholeNumber;

  if (isMinutes) {
    milliseconds = parsedDuration * 60 * 1000;
    durationDescription = `${parsedDuration} minute${parsedDuration === 1 ? '' : 's'}`;
  } else {
    milliseconds = parsedDuration * 60 * 60 * 1000;
    durationDescription = `${parsedDuration} hour${parsedDuration === 1 ? '' : 's'}`;
  }
}

console.log(`Mac will sleep in ${durationDescription}`);
console.log(`Press Ctrl+C to cancel\n`);

const startTime = Date.now();
const endTime = startTime + milliseconds;

// Function to format time as HH:MM:SS
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update countdown every second
const countdownInterval = setInterval(() => {
  const remaining = endTime - Date.now();

  if (remaining <= 0) {
    clearInterval(countdownInterval);
    return;
  }

  process.stdout.write(`\rTime remaining: ${formatTime(remaining)}`);
}, 1000);

// Show initial countdown
process.stdout.write(`\rTime remaining: ${formatTime(milliseconds)}`);

setTimeout(() => {
  clearInterval(countdownInterval);
  console.log('\n\nPutting Mac to sleep now...');
  exec('pmset sleepnow', (error) => {
    if (error) {
      console.error(`Error executing sleep command: ${error.message}`);
      process.exit(1);
    }
  });
}, milliseconds);
