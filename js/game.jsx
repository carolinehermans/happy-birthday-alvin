import React from 'react'

class Game extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      activeObjects: [], // Objects falling down the screen
      score: 0,
      playerX: window.innerWidth / 2,
      playerY: 500, // Player's distance from top of screen
      moveAmount: 40, // Player's horizontal movement per move
      timeElapsed: 0,
      catchRadius: 130, // Distance that the player can catch horizontally
      vertCatchRadius: 10,
      mode: 'normal',
      danishPoints: 100, // Switch over to danish mode
      danishSet: false,
      lives: 3,
      invalidIndexes: [] // Indexes of objects that are no longer valid
    }

    // Instance-wide property allows us to add/remove eventlisteners while
    // maintaining correct 'this' binding.
    this.boundKeyDown = this.onKeyDown.bind(this)

    this.characterImage = this.props.characters[this.props.selectedCharacter].image
  }

  updateGameState () {
    // Update time elapsed
    this.setState({timeElapsed: this.state.timeElapsed + 1})

    // Check to see if the player is ready to enter danish mode
    if (this.state.score >= this.state.danishPoints && !this.state.danishSet) {
      // Update game state if player has entered danish mode
      this.setState({
        mode: 'danish',
        danishSet: true,
        moveAmount: 60,
        vertCatchRadius: 20
      })
    }

    // Update each object's vertical position and check to see if it is valid
    var updatedActiveObjects = this.state.activeObjects.map(function ({x, y}, i) {
      var invalid = false
      var index = this.state.invalidIndexes.indexOf(i)

      // If the object is invalid, flag it for removal
      if (index !== -1) {
        invalid = true
      }

      // Update object's vertical position. Amount is dependent on game mode
      if (this.state.mode === 'normal') {
        return (
          {
            x: x,
            y: y + 20,
            invalid: invalid
          }
        )
      } else {
        return (
          {
            x: x,
            y: y + 32,
            invalid: invalid
          }
        )
      }
    }.bind(this))

    this.setState({activeObjects: updatedActiveObjects})

    // Add new objects

    // Condition for adding a new object is dependent on game mode
    var danishCondition = this.state.timeElapsed / 2 % 2 === 1
    var normalCondition = this.state.timeElapsed % 13 === 2 || this.state.timeElapsed % 13 === 10

    // Add a new object if the time fullfils the necessary conditions
    if (danishCondition && this.state.mode === 'danish' || normalCondition && this.state.mode === 'normal') {
      // Spawn a new object at the top of the screen with random x position
      var newX = Math.floor(Math.random() * (1100)) + 50
      if (window.innerWidth > 1200) {
        newX = Math.floor(Math.random() * 1200) + ((window.innerWidth - 1200) / 2)
      }
      var newObject = {
        x: newX,
        y: 0,
        invalid: false
      }
      
      // Add the new object to the list of objects
      if (newX <= window.innerWidth - 40) {
        this.state.activeObjects.push(newObject)
      }
    }

    this.state.activeObjects.map(function ({x, y}, i) {
      // Do not interact with invalid objects
      var index = this.state.invalidIndexes.indexOf(i)
      if (index !== -1) {
        return
      }

      // Check for collision with the player
      if (x >= this.state.playerX - 20 && x <= this.state.playerX + this.state.catchRadius && y >= this.state.playerY - this.state.vertCatchRadius) {
        this.setState({score: this.state.score + 10})
        var invalidIndexes = this.state.invalidIndexes
        invalidIndexes.push(i)
        this.setState({invalidIndexes})
      }

      // Check for loss of a life
      if (y > this.state.playerY + this.state.catchRadius) {
        this.setState({lives: this.state.lives - 1})
        var indexesCopy = this.state.invalidIndexes
        indexesCopy.push(i)
        this.setState({indexesCopy})
      }

      // Check for game over
      if (this.state.lives === 0) {
        this.props.setFinalScore(this.state.score)
        this.props.setView(2)
      }
    }.bind(this))
  }

  componentDidMount () {
    window.document.addEventListener('keydown', this.boundKeyDown)
    this.timer = setInterval(this.updateGameState.bind(this), 300)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
    window.document.removeEventListener('keydown', this.boundKeyDown)
  }

  // Move player in x direction on arrow keys
  onKeyDown (e) {
    if (e.keyCode === 39 && this.state.playerX < window.innerWidth - 150) {
      this.setState({playerX: this.state.playerX + this.state.moveAmount})
    }
    if (e.keyCode === 37 && this.state.playerX + 30 > this.state.moveAmount) {
      this.setState({playerX: this.state.playerX - this.state.moveAmount})
    }
  }

  render () {
    // Display the objects as different images depending on game mode
    var objects = this.state.activeObjects.map(function ({x, y, invalid}, i) {
      var images = []
      if (this.state.mode === 'normal') {
        images = ['present1.png', 'present2.png', 'present3.png', 'cake.png']
      } else {
        images = ['snowman.png', 'snowflake.png', 'snowman.png']
      }
      const imageIndex = i % images.length
      const image = images[imageIndex]
      return (
        <img src={`./static/img/${image}`} className={`object scored-${invalid}`} key={i} style={{left: x + 'px', top: y + 'px'}} />
      )
    }.bind(this))

    return (
      <div className={`${this.state.mode}`}>
      <iframe width='420' height='315' src='https://www.youtube.com/embed/5oLd-vYCd9k?autoplay=1&loop=1&start=15&playlist=5oLd-vYCd9k' frameBorder='0'></iframe>
        <div className='game' onKeyDown={this.boundKeyDown.bind(this)}>
          <div className='header'>
            <div className='stats-container-container'>
              <div className='stats-container'>
                <div className='stats'>
                  <h2 className='normal-show'>{`Score: ${this.state.score}`}</h2>
                  <h2 className='danish-show'>{`PUNTER: ${this.state.score}`}</h2>
                </div>
                <div className={`stats lives lives-${this.state.lives}`}>
                  <h2 className='normal-show'>Lives:
                    <img className='life life-1' src={`./static/img/little${this.characterImage}`}/>
                    <img className='life life-2' src={`./static/img/little${this.characterImage}`}/>
                    <img className='life life-3' src={`./static/img/little${this.characterImage}`}/>
                  </h2>
                  <h2 className='danish-show'>LIV:
                    <img className='life life-1' src='./static/img/fish.png'/>
                    <img className='life life-2' src='./static/img/fish.png'/>
                    <img className='life life-3' src='./static/img/fish.png'/>
                  </h2>
                </div>
                <div className='stats normal-show'>
                  <h2>{`Points until Danish Mode: ${this.state.danishPoints - this.state.score}`}</h2>
                </div>
              </div>
            </div>
          </div>
          <img className='player' style={{left: this.state.playerX + 'px', top: this.state.playerY + 'px'}} src={`./static/img/${this.characterImage}`}/>
          {objects}
        </div>
        <div className='lower-bar' style={{height: window.innerHeight - this.state.playerY - 80 + 'px'}}>
          <h1 className='normal-show'>Catch the birthday stuff using the arrow keys!</h1>
          <h1 className='danish-show'>DANSK MODE AKTIVERET</h1>
        </div>
      </div>
    )
  }
}

export default Game
