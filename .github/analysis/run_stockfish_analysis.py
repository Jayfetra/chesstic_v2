"""
Standalone script to run Stockfish mistake analysis.
Run this script outside of Jupyter to avoid asyncio issues on Windows.

Usage:
    python run_stockfish_analysis.py

Output:
    - Saves detailed mistake analysis to JSON file
    - Can be loaded and analyzed in the notebook
"""

import sys
import os
from datetime import datetime
import json

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

from app.services.chess_service import ChessService
from app.services.analytics_service import AnalyticsService

# Configuration
USERNAME = 'jay_fh'
START_DATE = '2026-01-01'
END_DATE = '2026-01-31'
TIMEZONE = 'Bangkok'
STOCKFISH_PATH = r'D:\Project\chesstic_v2\stockfish\stockfish\stockfish-windows-x86-64-avx2.exe'

def main():
    print("=" * 60)
    print("STOCKFISH MISTAKE ANALYSIS (Standalone Script)")
    print("=" * 60)
    
    # Initialize services
    print("\n1. Initializing services...")
    chess_service = ChessService()
    analytics_service = AnalyticsService(
        stockfish_path=STOCKFISH_PATH,
        engine_depth=12,
        engine_enabled=True
    )
    print("   ✓ Services initialized")
    
    # Fetch games
    print(f"\n2. Fetching games for {USERNAME} from {START_DATE} to {END_DATE}...")
    start = datetime.strptime(START_DATE, '%Y-%m-%d')
    end = datetime.strptime(END_DATE, '%Y-%m-%d')
    
    all_games = []
    current = start
    
    while current <= end:
        try:
            games = chess_service.get_games_by_month(USERNAME, current.year, current.month)
            
            filtered_games = []
            for game in games:
                game_date = datetime.fromtimestamp(game.get('end_time', 0))
                if start <= game_date <= end:
                    filtered_games.append(game)
            
            all_games.extend(filtered_games)
            print(f"   ✓ {current.strftime('%Y-%m')}: {len(filtered_games)} games")
        except Exception as e:
            print(f"   ✗ {current.strftime('%Y-%m')}: {str(e)}")
        
        if current.month == 12:
            current = current.replace(year=current.year + 1, month=1)
        else:
            current = current.replace(month=current.month + 1)
    
    print(f"\n   Total games fetched: {len(all_games)}")
    
    if not all_games:
        print("\n✗ No games found. Exiting.")
        return
    
    # Run mistake analysis
    print(f"\n3. Running Stockfish mistake analysis...")
    print("   This may take a few minutes...")
    
    mistake_analysis = analytics_service.mistake_analyzer.aggregate_mistake_analysis(
        games_data=all_games,
        username=USERNAME
    )
    
    sample_info = mistake_analysis.get('sample_info', {})
    print(f"   ✓ Analysis complete!")
    print(f"   Games analyzed: {sample_info.get('analyzed_games', 0)}")
    print(f"   Sample: {sample_info.get('sample_percentage', 0):.1f}%")
    
    # Display summary
    print(f"\n4. Analysis Summary:")
    for stage in ['early', 'middle', 'endgame']:
        stage_data = mistake_analysis.get(stage, {})
        if stage_data.get('total_moves', 0) > 0:
            print(f"\n   {stage.upper()}:")
            print(f"     Moves analyzed: {stage_data['total_moves']}")
            print(f"     Inaccuracies: {stage_data['inaccuracies']}")
            print(f"     Mistakes: {stage_data['mistakes']}")
            print(f"     Blunders: {stage_data['blunders']}")
            print(f"     Avg CP Loss: {stage_data['avg_cp_loss']}")
    
    # Save to JSON
    output_file = os.path.join(
        os.path.dirname(__file__),
        f'stockfish_analysis_{USERNAME}_{START_DATE}_to_{END_DATE}.json'
    )
    
    print(f"\n5. Saving results to file...")
    
    # Prepare data for JSON serialization
    output_data = {
        'metadata': {
            'username': USERNAME,
            'start_date': START_DATE,
            'end_date': END_DATE,
            'timezone': TIMEZONE,
            'analysis_date': datetime.now().isoformat(),
            'total_games': len(all_games)
        },
        'mistake_analysis': mistake_analysis,
        'games': all_games  # Include game data for reference
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, default=str)
    
    print(f"   ✓ Results saved to: {output_file}")
    
    print("\n" + "=" * 60)
    print("✓ ANALYSIS COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Open your Jupyter notebook")
    print("2. Run the 'Load Stockfish Analysis Results' cell")
    print("3. Explore the mistake data in DataFrame format")
    
    return output_file


if __name__ == "__main__":
    try:
        output_file = main()
        print(f"\nSuccess! File saved at: {output_file}")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
