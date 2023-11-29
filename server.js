const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname)));

//Array to store messages
let messages = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Route to serve chat.html
app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// GET route to send messages
app.get('/messages', (req, res) => {
  fs.readFile('messages.txt', 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading file');
      res.json({ status: 'error' });
      return;
    }

    // Split the file content into lines
    const lines = data.split('\n');

    // Split each line into a username and message
    const messages = lines.map(line => {
      if (line.includes(': ')) {
        const [username, message] = line.split(': ');
        return { username, message };
      }
    });

    res.json(messages);
  });
});

// POST route to handle login
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Now you can handle the username and password
  console.log(`Username: ${username}, Password: ${password}`);

  // Check if the username and password pair exists
  fs.readFile('logins.txt', 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading file');
      res.json({ status: 'error' });
      return;
    }

    const pair = `u:${username}p:${password}\n`;
    const userExists = data.includes(`u:${username}`);

    if (data.includes(pair)) {
      // If the pair exists, send them to the chat page
      res.json({ status: 'success', redirect: '/chat.html' });
    } else if (userExists) {
      // If the username exists but the password does not match, send an error
      res.json({ status: 'error', message: 'Incorrect password' });
    } else {
      // If the pair does not exist, store it in the file
      fs.appendFile('logins.txt', pair, (err) => {
        if (err) {
          console.log('Error writing to file');
        }
        res.json({ status: 'success', redirect: '/chat.html' });
      });
    }
  });
});

// POST route to handle messages
app.post('/message', (req, res) => {
  const message = req.body.message;
  const username = req.body.username;
  
  // Now you can handle the message
  console.log(`Message: ${username}: ${message}`);

  // Store the message and username in a file
  const data = `${username}: ${message}\n`;
  fs.appendFile('messages.txt', data, (err) => {
    if (err) {
      console.log('Error writing to file');
      res.json({ status: 'error' });
      return;
    }

    // Send a success status back to the client
    res.json({ status: 'success' });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});