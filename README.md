# React-Sudoku

How was this built?
I built this using React.js to acquire some practice using the framework and the sudoku backtracking algorithm.

How is the board generated?
I used a backtracking algorithm to generate a valid board, then removed elements at random. This way, I can be sure at least one solution is possible.

How does the backtracking algorithm work?
Sudoku solving is NP-complete, meaning that unless we figure out how to solve another NP-hard problem in polynomial time then solving sudoku will remain nonpolynomial. Fortunately for us, a solution can be verified in polynomial time which comes in handy later.

The backtracking algorithm works by finding an unfilled square, trying a valid random number between 1 and 9 in the square, and recursively calling itself. If the recursive path cannot find a valid solution for a particular recursive path, the path returns and a different number is tried.

Is there a unique solution?
I decided not to enforce a unique solution when generating the puzzle. This was because the only way to be sure to do so was to count the number of possible solutions each time a number is removed during generation(meaning solving the board many, many times). Since it would be rather resource-intensive on the frontend to do this before even rendering the board, I decided to allow multiple solutions. This means the solve and check implementations were a bit more challenging than comparing to a single unique solution. Another sudoku site that didn't want to generate a new board every visit could instead generate multiple boards (>100) with unique solutions using the method listed above. These could then store these in a database to later display to the user. Since I was playing around with React, I decided I wanted to instead generate the board on the front end.
