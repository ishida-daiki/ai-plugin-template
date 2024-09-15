'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type CellState = 'black' | 'white' | null
type Player = 'black' | 'white'
type GameState = 'entry' | 'playing' | 'finished'

const BOARD_SIZE = 8

export function OthelloGameComponent() {
  const [gameState, setGameState] = useState<GameState>('entry')
  const [players, setPlayers] = useState({ black: '', white: '' })
  const [board, setBoard] = useState<CellState[][]>(initializeBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [score, setScore] = useState({ black: 2, white: 2 })
  const [validMoves, setValidMoves] = useState<[number, number][]>([])

  function initializeBoard(): CellState[][] {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
    const mid = BOARD_SIZE / 2
    board[mid - 1][mid - 1] = board[mid][mid] = 'white'
    board[mid - 1][mid] = board[mid][mid - 1] = 'black'
    return board
  }

  function handlePlayerEntry(player: Player, name: string) {
    setPlayers(prev => ({ ...prev, [player]: name }))
  }

  function startGame() {
    if (players.black && players.white) {
      setGameState('playing')
      updateValidMoves('black')
    }
  }

  function handleCellClick(row: number, col: number) {
    if (gameState !== 'playing' || board[row][col] !== null) return
    if (!validMoves.some(([r, c]) => r === row && c === col)) return

    const flippedCells = getFlippedCells(row, col, currentPlayer)
    if (flippedCells.length === 0) return

    const newBoard = [...board.map(row => [...row])]
    newBoard[row][col] = currentPlayer
    flippedCells.forEach(([r, c]) => {
      newBoard[r][c] = currentPlayer
    })

    setBoard(newBoard)
    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(nextPlayer)
    updateValidMoves(nextPlayer)
  }

  function getFlippedCells(row: number, col: number, player: Player): [number, number][] {
    const opponent = player === 'black' ? 'white' : 'black'
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    const flippedCells: [number, number][] = []

    directions.forEach(([dx, dy]) => {
      let x = row + dx
      let y = col + dy
      const cellsToFlip: [number, number][] = []

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (board[x][y] === null) break
        if (board[x][y] === opponent) {
          cellsToFlip.push([x, y])
        } else if (board[x][y] === player) {
          flippedCells.push(...cellsToFlip)
          break
        }
        x += dx
        y += dy
      }
    })

    return flippedCells
  }

  function updateValidMoves(player: Player) {
    const moves: [number, number][] = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === null && getFlippedCells(row, col, player).length > 0) {
          moves.push([row, col])
        }
      }
    }
    setValidMoves(moves)

    if (moves.length === 0) {
      handlePass(player)
    }
  }

  function handlePass(player: Player) {
    const nextPlayer = player === 'black' ? 'white' : 'black'
    setCurrentPlayer(nextPlayer)
    updateValidMoves(nextPlayer)
  }

  useEffect(() => {
    const newScore = board.reduce((acc, row) => {
      row.forEach(cell => {
        if (cell === 'black') acc.black++
        if (cell === 'white') acc.white++
      })
      return acc
    }, { black: 0, white: 0 })
    setScore(newScore)

    if (newScore.black + newScore.white === BOARD_SIZE * BOARD_SIZE) {
      setGameState('finished')
    }
  }, [board])

  if (gameState === 'entry') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-800 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Player Entry</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="black-player" className="block text-sm font-medium text-gray-700">Black Player</label>
              <Input
                id="black-player"
                type="text"
                value={players.black}
                onChange={(e) => handlePlayerEntry('black', e.target.value)}
                placeholder="Enter name"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="white-player" className="block text-sm font-medium text-gray-700">White Player</label>
              <Input
                id="white-player"
                type="text"
                value={players.white}
                onChange={(e) => handlePlayerEntry('white', e.target.value)}
                placeholder="Enter name"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={startGame}
              disabled={!players.black || !players.white}
              className="w-full"
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-800 p-4">
      <div className="mb-4 text-white text-xl flex items-center">
        Current Player: 
        <span className="ml-2">
          {currentPlayer === 'black' ? players.black : players.white}
        </span>
        <div className={`w-6 h-6 rounded-full ml-2 ${currentPlayer === 'black' ? 'bg-black' : 'bg-white'}`} />
      </div>
      <div className="mb-4 text-white text-xl">
        Score - {players.black}: {score.black} | {players.white}: {score.white}
      </div>
      <div className="grid grid-cols-8 gap-1 bg-green-900 p-2 rounded-lg shadow-lg">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`w-12 h-12 bg-green-700 flex items-center justify-center cursor-pointer ${
                validMoves.some(([r, c]) => r === rowIndex && c === colIndex) ? 'bg-green-500' : ''
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {cell && (
                <motion.div
                  className={`w-10 h-10 rounded-full ${cell === 'black' ? 'bg-black' : 'bg-white'}`}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 180 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
      {gameState === 'finished' && (
        <div className="mt-4 text-white text-2xl">
          Game Over! Winner: {score.black > score.white ? players.black : players.white}
        </div>
      )}
    </div>
  )
}