import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Cell from './cell.js'
import './index.css';

//Class Component for each subgrid
class Neighbors extends Component{
  render(){
    return (
      <table>
        <tbody>
          <tr>
            <Square squares={this.props.squares[0]} handleChange={this.props.onChange}/>
            <Square squares={this.props.squares[1]} handleChange={this.props.onChange}/> 
            <Square squares={this.props.squares[2]} handleChange={this.props.onChange}/>
          </tr>
          <tr>
            <Square squares={this.props.squares[3]} handleChange={this.props.onChange}/>
            <Square squares={this.props.squares[4]} handleChange={this.props.onChange}/>
            <Square squares={this.props.squares[5]} handleChange={this.props.onChange}/>
          </tr>
          <tr>
            <Square squares={this.props.squares[6]} handleChange={this.props.onChange}/>
            <Square squares={this.props.squares[7]} handleChange={this.props.onChange}/>
            <Square squares={this.props.squares[8]} handleChange={this.props.onChange}/>
          </tr>
        </tbody>
      </table>
    );
  }
};

//Class component for each square
class Square extends Component{
  //Constructor for square that sets the model data members with prop data
  constructor(props){
    super(props);
    this.state = {
      id : props.squares.id,
      value : props.squares.value,
      prefilled: props.squares.prefilled
    };
  }

  //Handler for square value on change event
  doChange(e){
    this.setState({
      value: e.target.value
    })
    this.props.handleChange(e.target.value, e.target.id)
  }

  //render method for our square component that sets the color of the square depending on conditionals
  render(){
    let className = this.state.prefilled ? "square square-grey" : "square square-white"
    if(this.props.squares.incorrect){
      className = "square square-red"
    }
    //Each square holds an input for a number where only a single digit can be input, and the value of the
    //input is either the value of the props or is empty
    return (
      <td>
      <div className={className}> 
        <input inputMode="numeric" size="2" maxLength="1"  
        type="text" autoComplete="off" onChange={this.doChange.bind(this)} 
        value={this.props.squares.value || ''} id={this.state.id} disabled={this.state.prefilled} />
      </div>
      </td>
    )
  }
}

//Class for the entire board itself
class Board extends Component{
  //Constructor creates the board and the inital state of our game. 
  constructor(props){
    super(props)
    this.filledSquares = 81;
    let board = this.generateBoard(Array())
    let edgeBoard = JSON.parse(JSON.stringify(board))
    this.state = {
      incorrectValues: [],
      correctBoard: board,
      history: [
        {
          squares: this.removeSquares(edgeBoard)
        }
      ],
      stepNumber: 0,
      filledSquares: this.filledSquares
    }
  }
  
  //Event handler when the undo button is pressed
  undo() {
    let step = this.state.stepNumber
    //If this is not our first step, decrement the step number and the number of filled steps
    if(step > 0){
      this.state.history.pop()
      this.setState({
        stepNumber: (step - 1),
        filledSquares: this.state.filledSquares - 1,
        history: this.state.history
      });  
    }  
  }
  
  //Render our entire board, passing the state of our board to the columns below
  render(){
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    return (
      <div align="center">
          <h1>Sudoku by Justin Bethel</h1>
          <Column squares={current.squares.slice(0, 27)} 
            handleChange={this.handleChange.bind(this)}/>
          <Column squares={current.squares.slice(27, 54)}
            handleChange={this.handleChange.bind(this)}/>
          <Column squares={current.squares.slice(54, 81)} 
            handleChange={this.handleChange.bind(this)}/>
          <div>
            <button onClick={() => this.undo()}>Undo</button>
            <button onClick={() => this.solveSolution()}>Solve</button>
          </div>
      </div>
    );
  }

  //If an input value is changed, validate it, then add it to our board
  handleChange(value, id){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    //Performs a deep copy of the previous array
    let squares = JSON.parse(JSON.stringify(current.squares))
    squares[id].value = Number(value) ? Number(value) : null
    //Performs a deep copy of the JS array
    const backTrackTest = JSON.parse(JSON.stringify(squares))
    let ourFilledSquares = Number(value) ? this.state.filledSquares + 1 : this.state.filledSquares - 1
    if(squares[id].value < 10 && value !== "0" && !isNaN(Number(value))){
      //If the updated square was not a backspace and is not valid in terms of board constraints or 
      //does not yield itself to a possible solution
      if(squares[id].value !== null && (!this.validSpace(backTrackTest, id, squares[id].value) 
        || !this.backTracking(backTrackTest))){
        squares[id].incorrect = true
      }
      //If the value was backspaced, set incorrect to null
      if(squares[id].value === null){
        squares[id].incorrect = false
      }
      //Update our state if the inputs were valid
      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        filledSquares : ourFilledSquares,
        solved: false
      })
    }
  }

  //Check to see if a passed in number was previously used in the same column
  usedInCol(squares, index, target){
    let baseIndex = (Math.floor(index/27)*27 + index % 3);
    for(let i = baseIndex ; (i < baseIndex + 27); i+=3){
      if(index != i && squares[i] && squares[i].value === target && 
        target && i !== index){
        return true;
      }
    }
    return false;
  }

  //Check to see if a passed in number was previously was used in the same square
  usedInSquare(squares, index, target){
    let baseIndex = (Math.floor(index/9) * 9)
    for(let i = baseIndex; i < (baseIndex + 9); i++){
      if(index != i && squares[i] && squares[i].value === target 
        && target && index !== i){
        return true;
      }
    }
    return false;
  }

  //Check to see if any of the squares holds an incorrect value
  incorrectBoardCheck(squares){
    for(let i = 0; i < 81; i++){
      if(squares[i].incorrect){
        return true;
      }
    }
    return false;
  }

  //If the solve button is pressed, then we solve the board from its current state
  //using backtracking and then update the board to reflect this
  solveSolution(){
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = JSON.parse(JSON.stringify(current.squares))
    if(this.backTracking(squares) && !this.incorrectBoardCheck(squares)){
      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        filledSquares : 81,
        solved: true
      })
      return true
    }
    else {
      return false
    }
  }

  //Check to see if the input number was previously used in the same row for generating the board
  usedInRow(squares, index, target){
    let baseIndex = 3 * Math.floor(index/3) - (27 * Math.floor(index/27))
    for(let i = 0; i < 9; i++){
      let adjustedIndex = baseIndex + i%3 + Math.floor(i/3)*27
        if(squares[adjustedIndex] && squares[adjustedIndex].value === target && target){
          return true;
        }
    }
    return false;
  }

  //Check to see if the number was previously used in the same row for checking possible solutions
  usedInCompletedRow(squares, index, target){
    let baseIndex = 3 * Math.floor(index/3) - (27 * Math.floor(index/27))
    for(let i = 0; i < 9; i++){
      let adjustedIndex = baseIndex + i%3 + Math.floor(i/3)*27
        if(index != adjustedIndex && squares[adjustedIndex] 
          && squares[adjustedIndex].value === target && target){
          return true;
        }
    }
    return false;
  }

  //Initialize our board to null
  initializeEmptylist(squares){
    for(let i = 0; i < 81; i++){
      squares[i] = new Cell(i, null)
    }
  }

  //Backtracking algorithm that solves the board
  //Used both for generating the board and validating number inputs
  backTracking(squares){
    const index = this.findUnassignedLocation(squares);
    if(index < 0){
      return true;
    }
    for(let i = 1; i < 10; i++){
      if(this.isSafeCell(squares, index, i)){
        squares[index].value = i

        if(this.backTracking(squares)){
          return true;
        }

        squares[index].value = null;
      }
    }
    return false;
  }

  //Find the next unassigned location for the backtracking algorithm
  findUnassignedLocation(squares)  {  
    for (let i = 0; i < 81; i++){
      if(squares[i].value == null){
        return i;
      }  
    }
    return -1;  
} 

  //Check to see if the target value can be placed in the square index
  isSafeCell(squares, index, target){
    if(this.usedInCol(squares, index, target) || 
        this.usedInSquare(squares, index, target) || 
        this.usedInRow(squares, index, target)){
      return false;
    }
    return true;
  }

  //Checks whole board to see if the board is valid in its current state
  checkSolution(){
    const current = this.state.history[this.state.stepNumber].squares;
    for(let i = 0; i < 81; i++){
      if (!this.isSafeCell(current, i, current[i].value)){
        return false
      }
    }
    return true
  }

  //Generate our board array
  generateBoard(squares){
    this.initializeEmptylist(squares)
    this.fillSquare(squares, 0);
    this.fillSquare(squares, 36)
    this.fillSquare(squares, 72)
    this.backTracking(squares)
    return squares
  }

  //Remove numbers at random from our array 
  //Each square has a 50/81 chance of being removed
  removeSquares(squares){
    for (let i = 0; i < 81; i++){
      let random = (Math.floor(Math.random() * 81))
      if(random > 33){
        squares[i].value = null;
        squares[i].prefilled = false
        this.filledSquares -= 1
      }
    }
    return squares
  }

  //Fill a subgrid with numbers, used in backtracking
  fillSquare(squares, index){
    for(let i = 0; i < 9; i++){
      let random;
      do{
        random = Math.floor(Math.random() * 9 + 1);
      } while(!this.isSafeCell(squares, index, random));
      squares[index + i].value = random
    }
  }

  //Used to check that a previous input number is valid
  validSpace(squares, index, random){
    if (this.usedInCompletedRow(squares, index, random) || 
    this.usedInCol(squares, index, random) || 
    this.usedInSquare(squares, index, random)){
      return false;
    }
    return true;
  }
}

//Class component for each column. Holds three subgrids
class Column extends Component{
  render(){
    return(
      <div className="column">
            <Neighbors squares={this.props.squares.slice(0,9)}
              onChange={this.props.handleChange}/>
            <Neighbors squares={this.props.squares.slice(9,18)}
              onChange={this.props.handleChange}/>
            <Neighbors squares={this.props.squares.slice(18,27)}
              onChange={this.props.handleChange}/>
      </div>
    )
  }
}

  // ========================================
  ReactDOM.render(
    <Board />,
    document.getElementById('root')
  );
  