import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      response: ''
    }
  }

  componentDidMount() {
    fetch('/api/auth')
      .then(res => res.json())
      .then(res => {
        this.setState({
          loading: false,
          response: res.message
        })
      })
      .catch(e => console.error(e))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            {this.state.loading ? 'Loading...' : this.state.response}
          </p>
        </header>
      </div>
    );
  }
}

export default App;
