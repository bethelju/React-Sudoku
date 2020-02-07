import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Neighbors extends Component{
  constructor(props){
    super(props)
    console.log(props.onChange)
  }
  render(){
    return (
      <table>
        <tr>
          <Square squares={this.props.squares[0]} index={this.props.indices[0]} handleChange={this.props.onChange}/>
          <Square squares={this.props.squares[1]} index={this.props.indices[1]} handleChange={this.props.onChange}/> 
          <Square squares={this.props.squares[2]} index={this.props.indices[2]} handleChange={this.props.onChange}/>
        </tr>
        <tr>
          <Square squares={this.props.squares[3]} index={this.props.indices[3]} handleChange={this.props.onChange}/>
          <Square squares={this.props.squares[4]} index={this.props.indices[4]} handleChange={this.props.onChange}/>
          <Square squares={this.props.squares[5]} index={this.props.indices[5]} handleChange={this.props.onChange}/>
        </tr>
        <tr>
          <Square squares={this.props.squares[6]} index={this.props.indices[6]} handleChange={this.props.onChange}/>
          <Square squares={this.props.squares[7]} index={this.props.indices[7]} handleChange={this.props.onChange}/>
          <Square squares={this.props.squares[8]} index={this.props.indices[8]} handleChange={this.props.onChange}/>
        </tr>
      </table>
    );
  }
};

class Square extends Component{
  constructor(props){
    super(props);
    console.log(props)
    this.state = {
      id : props.index,
      value : props.squares
    };
  }

  doChange(e){
    this.props.handleChange(e.target.value, e.target.id)
  }

  render(){
    return (
      <div class="square"> 
        <td><input size="2" maxLength="1" 
        type="text" autocomplete="off" onChange={this.doChange.bind(this)} 
        value={this.state.value} id={this.state.id}/></td>
      </div>
    )
  }
}

class Board extends Component{
  constructor(props){
    super(props)
    let board = this.generateBoard(Array(81).fill(null))
    let edgeBoard = board.slice()
    printBoard(board)
    this.state = {
      correctBoard: board,
      squares: this.removeSquares(edgeBoard),
    }
  }

  render(){
    return (
      <div>
          <Column squares={this.state.squares.slice(0, 27)} indices={{startIndex:0, endIndex:27}} 
            handleChange={this.handleChange.bind(this)}/>
          <Column squares={this.state.squares.slice(27, 54)} indices={{startIndex:27, endIndex: 54}}
            handleChange={this.handleChange.bind(this)}/>
          <Column squares={this.state.squares.slice(54, 81)} indices={{startIndex:54, endIndex: 81}}
            handleChange={this.handleChange.bind(this)}/>
      </div>
    )
  }

  handleChange(value, id){
    let currentSquares = this.state.squares
    currentSquares[id] = Number(value)
    this.setState({
      squares: currentSquares
    });
    console.log(JSON.stringify(currentSquares));
    console.log(JSON.stringify(this.state.correctBoard));
    if(JSON.stringify(currentSquares) === JSON.stringify(this.state.correctBoard)){
      console.log("KILLED IT")
    }
  }


  usedInCol(squares, index, target){
    let baseIndex = (Math.floor(index/27)*27 + index % 3);
    for(let i = baseIndex ; (i < baseIndex + 27); i+=3){
      if(squares[i] === target && target){
        return true;
      }
    }
    return false;
  }

  usedInSquare(squares, index, target){
    let baseIndex = (Math.floor(index/9) * 9)
    for(let i = baseIndex; i < (baseIndex + 9); i++){
      if(squares[i] === target && target){
        return true;
      }
    }
    return false;
  }

  usedInRow(squares, index, target){
    let baseIndex = 3 * Math.floor(index/3) - (27 * Math.floor(index/27))
    let trackingIndex;
    for(let i = 0; i < 9; i++){
      if(squares[baseIndex + i%3 + Math.floor(i/3)*27] === target && target){
        return true;
      }
    }
    return false;
  }

  backTracking(squares){
    const index = this.findUnassignedLocation(squares);
    if(index < 0){
      return true;
    }
    for(let i = 1; i < 10; i++){
      if(this.isSafeCell(squares, index, i)){
        squares[index] = i;

        if(this.backTracking(squares)){
          return true;
        }

        squares[index] = null;
      }
    }
    return false;
  }

  findUnassignedLocation(squares)  {  
    for (let i = 0; i < 81; i++){
      if(squares[i] == null){
        return i;
      }  
    }
    return -1;  
} 

  isSafeCell(squares, index, target){
    if(this.usedInRow(squares, index, target) || 
        this.usedInCol(squares, index, target) || 
        this.usedInSquare(squares, index, target)){
      return false;
    }
    return true;
  }

  generateBoard(squares){
    this.fillSquare(squares, 0);
    this.fillSquare(squares, 36)
    this.fillSquare(squares, 72)
    this.backTracking(squares)
    //this.removeSquares(squares)
    return squares
  }

  removeSquares(squares){
    for (let i = 0; i < 81; i++){
      let random = (Math.floor(Math.random() * 81))
      if(random > 79){
        squares[i] = null;
      }
    }
    return squares
  }

  fillSquare(squares, index){
    for(let i = 0; i < 9; i++){
      let random;
      do{
        random = Math.floor(Math.random() * 9 + 1);
      } while(this.usedInRow(squares, index + i, random) || this.usedInCol(squares, index + i, random) || this.usedInSquare(squares, index + i, random));
      squares[index + i] = random;
    }
  }
}

class Column extends Component{
  constructor(props){
    super(props)
    let beginning = Array.from(Array(9).keys())
    this.n1 = beginning.map(x => x + props.indices.startIndex)
    this.n2 = beginning.map(x => x + props.indices.startIndex + 9)
    this.n3 = beginning.map(x => x + props.indices.startIndex + 18)
  }

  render(){
    return(
      <div class="column">
            <Neighbors squares={this.props.squares.slice(0,9)} indices={this.n1}
              onChange={this.props.handleChange}/>
            <Neighbors squares={this.props.squares.slice(9,18)} indices={this.n2}
              onChange={this.props.handleChange}/>
            <Neighbors squares={this.props.squares.slice(18,27)} indices={this.n3}
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
  
  function printBoard(board){
    for(let i = 0; i < 81; i++){
      console.log(board[i]);
    }
  }