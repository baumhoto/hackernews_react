import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    const helloWord = 'Welcome to the Road to learn React'
    return (
      <div className="App">
        <h2>{helloWord}</h2>
      </div>
    );
  }
}

export default App;
