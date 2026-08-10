import chess
import chess.engine
import os

# Path to your downloaded Stockfish executable 
# (Make sure to download Stockfish and place its path here)
STOCKFISH_PATH = "/usr/games/stockfish"  # Update to your local path (e.g., "C:/stockfish/stockfish.exe")

def play_game():
    if not os.path.exists(STOCKFISH_PATH):
        print(f"Error: Stockfish binary not found at {STOCKFISH_PATH}.")
        print("Please download Stockfish and update the STOCKFISH_PATH variable.")
        return

    board = chess.Board()
    
    # Initialize the Stockfish engine
    try:
        engine = chess.engine.SimpleEngine.spawn_uci(STOCKFISH_PATH)
    except Exception as e:
        print(f"Failed to start Stockfish engine: {e}")
        return

    print("=== Magnus Bot (Powered by Stockfish) Initialized ===")
    print(board)

    try:
        while not board.is_game_over():
            if board.turn == chess.WHITE:
                # Human player's turn (or change this logic to play against another bot)
                move_input = input("\nEnter your move (e.g., e2e4): ")
                try:
                    move = chess.Move.from_uci(move_input)
                    if move in board.legal_moves:
                        board.push(move)
                    else:
                        print("Illegal move! Try again.")
                        continue
                except ValueError:
                    print("Invalid format! Use UCI format like e2e4.")
                    continue
            else:
                print("\nMagnus AI is thinking...")
                # Ask Stockfish for the absolute best move (top move)
                # You can configure skill level, time limit, or depth here
                result = engine.play(board, chess.engine.Limit(time=1.0))
                
                board.push(result.move)
                print(f"Magnus plays: {result.move}")

            print("\nCurrent Board:")
            print(board)

        print("\nGame Over!")
        print("Result:", board.result())

    finally:
        engine.quit()

if __name__ == "__main__":
    play_game()
