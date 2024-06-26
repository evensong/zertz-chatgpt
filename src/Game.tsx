export type SpaceState = 'Removed' | 'Open' | 'White' | 'Gray' | 'Black';

export const BOARD_SIZE = 7;

const board: SpaceState[][] = Array(BOARD_SIZE).map(row => Array(BOARD_SIZE).map(col => 'Open'));

export const initBoard = () => {
    for (let i=0; i < 3; i++) {
        for (let j=0; j < 3-i; j++) {
            board[i][j] = 'Removed';
            board[BOARD_SIZE-i-1][BOARD_SIZE-j-1];
        }
    }
}


export const canRemove = (row: number, col: number) =>
{
    if (board[row][col] != 'Open') return false;

    //	\0\1\2\3\4\5\6\
    // 0 \ \ \ \O\O\O\O\
	// 1  \ \ \O\O\O\O\O\
	// 2   \ \O\O\O\O\O\O\
	// 3    \O\O\O\O\O\O\O\
	// 4     \O\O\O\O\O\O\ \
	// 5      \O\O\O\O\O\ \ \
	// 6       \O\O\O\O\ \ \ \

    // List neighbor cells in circular fashion, repeating first at the end
    const neighbors: SpaceState[] = getNeighbors(row, col);

    // If any two neighbors in a row are Removed,
    // then this space can be removed
    let previous: SpaceState = 'Open';
    for (let current of neighbors)
    {
        if (previous == 'Removed' && current == 'Removed') return true;
        previous = current;
    }

    return false;
}

export const getNeighbors = (row: number, col: number): SpaceState[] => {
    const neighbors: SpaceState[] = [
        board[row - 1][col],
        board[row - 1][col + 1],
        board[row][col + 1],
        board[row + 1][col],
        board[row + 1][col - 1],
        board[row][col - 1],
        board[row - 1][col]
    ];
    return neighbors;
}

const isOccupied = (row: number, col: number) => {
    return (board[row][col] === 'White' ||
            board[row][col] === 'Gray' ||
            board[row][col] === 'Black');
}

export const isChangeAllowed = (row: number, col: number, newState: SpaceState) => {
    let allowed = false;
    switch (newState) {
        case 'White':
        case 'Black':
        case 'Gray':
            allowed = (board[row][col] === 'Open');
            break;
        case 'Open':
            allowed = isOccupied(row, col);
            break;
        case 'Removed':
            allowed = canRemove(row, col);
    }
    return allowed;
}

export const setState = (row: number, col: number, newState: SpaceState) => {
    if (isChangeAllowed(row, col, newState)) {
        board[row][col] = newState;
        return true;
    } else {
        return false;
    }
}

export const getJumps = () => {
    // For each occupied ring, calculate whether the stone there can make any jumps,
    // then return a boolean mask of the board where stones with jumps available are
    // indicated as true and all else are shown as false.

    let jumps: boolean[][] = Array(BOARD_SIZE).map(row => Array(BOARD_SIZE).map(col => false));
    
    for (let i = 0; i < jumps.length; i++) {
        for (let j = 0; j < jumps[i].length; j++) {

            if (!isOccupied(i,j)) { // Ignore unoccupied rings
                continue;
            } 

            // only one condition need be met for the ring to have a jump possible
            else if (j+2 <= jumps[i].length && isOccupied(i, j+1) && board[i][j+2] === 'Open') { // check for straight right jump
                jumps[i][j] = true;
            }
            else if (j-2 >= 0 && isOccupied(i, j-1) && board[i][j-2] === 'Open') { // check for straight left jump
                jumps[i][j] = true;
            }
            else if (i-2 >= 0 && isOccupied(i-1, j) && board[i-2][j] === 'Open') { // check for up left diagonal jump
                jumps[i][j] = true;
            }
            else if (i-2 >= 0 && j+2 <= jumps[i].length && isOccupied(i-1, j+1) && board[i-2][j+2] === 'Open') { // check for up right diagonal jump
                jumps[i][j] = true;
            }
            else if(i+2 <= jumps.length && isOccupied(i+1, j) && board[i+2][j] === 'Open') { // check for down right diagonal jump
                jumps[i][j] = true;
            }
            else if (i+2 <= jumps.length && j-2 >=0 &&isOccupied(i+1, j-1) && board[i+2][j-2] === 'Open') { // check for down left diagonal jump
                jumps[i][j] = true;
            }
        }
    }
    return jumps;
}