import React from 'react'

class Game extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
        activeObjects: [],
        score: 0,
        playerX: window.innerWidth/2,
        playerY: 500,
        fallTime: 300,
        moveAmount: 30,
        timeElapsed: 0,
        objectWidth: 10,
        catchRadius: 130,
        vertCatchRadius: 10,
        mode: 'normal',
        danishPoints: 50,
        danishSet: false,
        lives: 3,
        scoredIndexes: []
      }
      this.boundKeyDown = this.onKeyDown.bind(this)
      this.characterImage = this.props.characters[this.props.selectedCharacter].image
  }

  updateGameState() {
      //update time elapsed
      this.setState({timeElapsed: this.state.timeElapsed + 1})

      //check for danish mode
      if (this.state.score >= this.state.danishPoints && !this.state.danishSet) {
        this.setState({
          mode: 'danish',
          danishSet: true,
          moveAmount: 60,
          vertCatchRadius: 20,
        })
      }

      //make objects fall down the screen
      var updatedActiveObjects = this.state.activeObjects.map(function({x, y}, i) {
        var scored = false
        var scoredIndex = this.state.scoredIndexes.indexOf(i)
        //if it's already been scored, don't use it again
        if (scoredIndex != -1) {
          scored = true
        }

        if (this.state.mode == 'normal') {
          return (
            {
              x: x,
              y: y + 40,
              scored: scored
            }
          )
        } else {
          return (
            {
              x: x,
              y: y + 20,
              scored: scored
            }
          )
        }
      }.bind(this))

      this.setState({activeObjects: updatedActiveObjects})

      //time for a new object to be added
      var danishCondition = this.state.timeElapsed/2 % 2 == 1
      var normalCondition = this.state.timeElapsed/4 % 4 == 1
      if (danishCondition && this.state.mode == 'danish' || normalCondition && this.state.mode == 'normal') {
        var newObject = {
          x: Math.floor(Math.random() * (window.innerWidth - 200)) + 100,
          y: 0,
          scored: false
        }
        this.state.activeObjects.push(newObject);
      }


      this.state.activeObjects.map(function({x, y, color}, i) {
          var scoredIndex = this.state.scoredIndexes.indexOf(i)
          //if it's already been scored, don't use it again
          if (scoredIndex != -1) {
            return
          }

          //check for collision
          if (x >= this.state.playerX - 20 && x <= this.state.playerX + this.state.catchRadius && y >= this.state.playerY - this.state.vertCatchRadius) {
            this.setState({score: this.state.score + 10})
            var scoredIndexes = this.state.scoredIndexes
            scoredIndexes.push(i)
            this.setState({scoredIndexes})
          }

          //check for loss of a life
          if (y > this.state.playerY + this.state.catchRadius) {
            this.setState ({lives: this.state.lives - 1})
            var scoredIndexes = this.state.scoredIndexes
            scoredIndexes.push(i)
            this.setState({scoredIndexes})
          }

          //check for game over
          if (this.state.lives == 0) {
            this.props.setFinalScore(this.state.score)
            this.props.setView(2)
          }
      }.bind(this))
  }


  componentDidMount() {
    window.document.addEventListener('keydown', this.boundKeyDown)
    this.timer = setInterval(this.updateGameState.bind(this), this.state.fallTime);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    window.document.removeEventListener('keydown', this.boundKeyDown)
  }

  //move player X
  onKeyDown(e) {
    if (e.keyCode === 39 && this.state.playerX < window.innerWidth - 150) {
      this.setState({playerX: this.state.playerX + this.state.moveAmount})
    }
    if (e.keyCode === 37 && this.state.playerX + 30 > this.state.moveAmount) {
      this.setState({playerX: this.state.playerX - this.state.moveAmount})
    }
  }

  render() {

    var objects = this.state.activeObjects.map(function({x, y, scored}, i) {

      var images = []
      if (this.state.mode == 'normal') {
        images = ['present1.png', 'present2.png', 'present3.png', 'cake.png']
      }
      else {
        images = ['snowman.png', 'snowflake.png', 'snowman.png']
      }

      const imageIndex = i % images.length

      var image = images[imageIndex]

      return (
        <img src={`./static/img/${image}`} className={`object scored-${scored}`} key={i} style={{left: x + 'px', top: y + 'px'}} />
      )
    }.bind(this))

    return (
      <div className={`${this.state.mode}`}>
      <iframe width="420" height="315" src="https://www.youtube.com/embed/5oLd-vYCd9k?autoplay=1&loop=1&start=15&playlist=5oLd-vYCd9k" frameborder="0" allowfullscreen></iframe>
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
