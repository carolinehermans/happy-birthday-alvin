import React from 'react'
import {render} from 'react-dom'
import Game from './game.jsx'

class ChooseCharacter extends React.Component {

  componentDidMount () {
    // Always highlight the first character on load
    this.props.selectCharacter(0)
  }

  render () {
    // Differentiate between the selected character and the other ones
    const characters = this.props.characters.map(function({title, image}, i) {
      var selected = 'not-selected'
      if (i == this.props.selectedCharacter) {
          selected = 'selected'
      }

      return (
        <div className='character' onClick={() => this.props.selectCharacter(i)} key={i}>
          <div className={`${selected}`}>
            <img className='character-pic' src={`./static/img/${image}`}/>
            <img className='party-hat' src='./static/img/partyhat.png'/>
            <h1>{title}</h1>
          </div>
        </div>
      )
    }.bind(this))

    return (
      <div className='character-view'>
        <div className='wrapper'>
          <h1>HAPPY 16TH BIRTHDAY ALVIN!</h1>
          {characters}
          <div className='button' onClick={() => this.props.setView(1)}>
            <div className='button-text'>
              CHOOSE CHARACTER
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class GameOver extends React.Component {

  render () {
    return (
      <div className='game-over'>
        <h1>GAME ØVER</h1>
        <h2 className='score'>Score: {this.props.finalScore}</h2>
        <div className='button'onClick={() => this.props.setView(0)}>
          <div className='button-text'>
            PLAY AGAIN
          </div>
        </div>
        <h2 className='love'>💖 from Caroline</h2>
      </div>
    )
  }
}

class Main extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      selectedCharacter: 0,
      currentView: 0
    }

    this.views = [
      ChooseCharacter,
      Game,
      GameOver
    ].map(component => React.createFactory(component))

    this.characters = [
      {
        title: 'Alvin',
        image: 'alvin.png'
      },
      {
        title: 'Mittens',
        image: 'mittens.png'
      },
      {
        title: 'Tonks',
        image: 'tonks.png'
      }
    ]
  }

  selectCharacter (i) {
    this.setState({selectedCharacter: i})
  }

  setScore (score) {
    this.finalScore = score
  }

  setView (i) {
    console.log(this.state.selectedCharacter)
    this.setState({currentView: i})
  }

  setHomeView () {
    this.setState({currentView: 0})
  }

  render () {
    var views = this.views.map(view => view({
      setView: this.setView.bind(this),
      setHomeView: this.setHomeView.bind(this),
      selectCharacter: this.selectCharacter.bind(this),
      selectedCharacter: this.state.selectedCharacter,
      setFinalScore: this.setScore.bind(this),
      characters: this.characters,
      finalScore: this.finalScore
    }))
    return (
      <div>
        {views[this.state.currentView]}
      </div>
    )
  }
}

render(<Main/>, document.getElementById('root'))
