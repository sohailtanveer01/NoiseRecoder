import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Noiserec from './Noiserec'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Noiserec} />
      </Switch>
    </Router>
  )
}

export default App