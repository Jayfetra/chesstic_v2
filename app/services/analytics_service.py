"""
Analytics service for comprehensive chess game analysis.
"""
from datetime import datetime
from typing import Dict, List, Optional
from collections import defaultdict
import chess.pgn
from io import StringIO
import re
import logging

from app.utils.timezone_utils import (
    convert_utc_to_timezone, 
    get_time_of_day_category,
    get_date_string
)
from app.services.mistake_analysis_service import MistakeAnalysisService
from app.services.chess_advisor_service import ChessAdvisorService

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for advanced chess analytics calculations."""
    
    def __init__(self, stockfish_path: str = 'stockfish', engine_depth: int = 12,
                 engine_enabled: bool = True, openai_api_key: str = '',
                 openai_model: str = 'gpt-4o-mini'):
        """
        Initialize analytics service.
        
        Args:
            stockfish_path: Path to Stockfish executable
            engine_depth: Engine analysis depth (default: 12 in PRD v2.2)
            engine_enabled: Whether to enable engine analysis
            openai_api_key: OpenAI API key for AI advisor
            openai_model: OpenAI model to use
        """
        self.mistake_analyzer = MistakeAnalysisService(
            stockfish_path=stockfish_path,
            engine_depth=engine_depth,
            enabled=engine_enabled
        )
        self.ai_advisor = ChessAdvisorService(
            api_key=openai_api_key,
            model=openai_model
        )
    
    def analyze_detailed(
        self, 
        games: List[Dict], 
        username: str, 
        timezone: str = 'UTC',
        include_mistake_analysis: bool = True,
        include_ai_advice: bool = True,
        date_range: str = ''
    ) -> Dict:
        """
        Perform comprehensive analysis on games.
        
        Args:
            games: List of game dictionaries from Chess.com API
            username: Player's Chess.com username
            timezone: User's timezone string
            include_mistake_analysis: Whether to include engine mistake analysis (Milestone 8)
            include_ai_advice: Whether to include AI advisor recommendations (Milestone 9)
            date_range: Date range string for AI advisor context
            
        Returns:
            Comprehensive analysis results for all sections including M8 & M9
        """
        if not games:
            return self._empty_analysis()
        
        # Analyze all games
        analyzed_games = self._parse_and_enrich_games(games, username, timezone)
        
        # Core sections (Milestones 1-7)
        sections = {
            'overall_performance': self._analyze_overall_performance(analyzed_games),
            'color_performance': self._analyze_color_performance(analyzed_games),
            'elo_progression': self._analyze_elo_progression(analyzed_games),
            'termination_wins': self._analyze_termination_wins(analyzed_games),
            'termination_losses': self._analyze_termination_losses(analyzed_games),
            'opening_performance': self._analyze_opening_performance(analyzed_games),
            'opponent_strength': self._analyze_opponent_strength(analyzed_games),
            'time_of_day': self._analyze_time_of_day(analyzed_games)
        }
        
        # Milestone 8: Mistake analysis by game stage
        if include_mistake_analysis:
            logger.info("Starting mistake analysis...")
            mistake_analysis = self.mistake_analyzer.aggregate_mistake_analysis(games, username)
            
            # Identify weakest stage
            weakest_stage, reason = self.mistake_analyzer.get_weakest_stage(mistake_analysis)
            mistake_analysis['weakest_stage'] = weakest_stage
            mistake_analysis['weakest_stage_reason'] = reason
            
            sections['mistake_analysis'] = mistake_analysis
            logger.info("Mistake analysis complete")
        
        # Build result
        result = {
            'total_games': len(analyzed_games),
            'sections': sections
        }
        
        # Milestone 9: AI-powered chess advisor
        if include_ai_advice:
            logger.info("Generating AI coaching advice...")
            ai_advice = self.ai_advisor.generate_advice(result, username, date_range)
            sections['ai_advice'] = ai_advice
            logger.info("AI advice generated")
        
        return result
    
    def _parse_and_enrich_games(
        self, 
        games: List[Dict], 
        username: str, 
        timezone: str
    ) -> List[Dict]:
        """
        Parse and enrich game data with additional information.
        
        Args:
            games: Raw game data from Chess.com API
            username: Player's username
            timezone: User's timezone
            
        Returns:
            List of enriched game dictionaries
        """
        enriched = []
        username_lower = username.lower()
        
        for game in games:
            white = game.get('white', {})
            black = game.get('black', {})
            
            # Determine player's color and opponent
            if white.get('username', '').lower() == username_lower:
                player_color = 'white'
                player_data = white
                opponent_data = black
            else:
                player_color = 'black'
                player_data = black
                opponent_data = white
            
            # Get result
            result = player_data.get('result', '')
            
            # Convert timestamp to user's timezone
            end_time = game.get('end_time', 0)
            local_time = convert_utc_to_timezone(end_time, timezone)
            
            # Extract opening name from PGN
            opening_name = self._extract_opening_name(game.get('pgn', ''))
            
            # Extract termination type
            termination = self._extract_termination(game)
            
            enriched.append({
                'pgn': game.get('pgn', ''),
                'end_time': end_time,
                'local_time': local_time,
                'date': get_date_string(local_time),
                'time_of_day': get_time_of_day_category(local_time),
                'player_color': player_color,
                'result': result,
                'player_rating': player_data.get('rating', 0),
                'opponent_rating': opponent_data.get('rating', 0),
                'opponent_username': opponent_data.get('username', 'Unknown'),
                'time_control': game.get('time_control', 'unknown'),
                'time_class': game.get('time_class', 'unknown'),
                'opening_name': opening_name,
                'termination': termination,
                'url': game.get('url', '')
            })
        
        # Sort by date
        enriched.sort(key=lambda x: x['end_time'])
        
        return enriched
    
    def _extract_opening_name(self, pgn_string: str) -> str:
        """
        Extract opening name from PGN without ECO codes.
        
        Args:
            pgn_string: PGN string from game data
            
        Returns:
            Human-readable opening name or 'Unknown Opening'
        """
        if not pgn_string:
            return 'Unknown Opening'
        
        try:
            pgn = StringIO(pgn_string)
            game = chess.pgn.read_game(pgn)
            
            if game is None:
                return 'Unknown Opening'
            
            # Get opening name and ECO from headers
            eco = game.headers.get('ECO', '')
            opening_name = game.headers.get('Opening', '')
            eco_url = game.headers.get('ECOUrl', '')
            
            # Strategy 1: Use Opening header and remove ECO code
            if opening_name:
                # Remove ECO code pattern (e.g., "C00: ", "E04: ")
                import re
                # Match ECO pattern at start: letter followed by 2 digits, optional colon/space
                cleaned_name = re.sub(r'^[A-E]\d{2}[\s:]*', '', opening_name).strip()
                
                if cleaned_name:
                    return cleaned_name
            
            # Strategy 2: Try to extract from ECOUrl (Chess.com specific)
            if eco_url:
                # ECOUrl format: https://www.chess.com/openings/...
                # Extract the path and convert to readable name
                try:
                    path = eco_url.split('/openings/')[-1]
                    # Convert URL slug to readable name
                    readable = path.replace('-', ' ').title()
                    # Remove trailing numbers and clean up
                    readable = re.sub(r'\s+\d+$', '', readable).strip()
                    if readable and len(readable) > 2:
                        return readable
                except:
                    pass
            
            # Strategy 3: Identify from first moves using common patterns
            board = game.board()
            moves = []
            for move in list(game.mainline_moves())[:10]:
                moves.append(board.san(move))
                board.push(move)
            
            if moves:
                opening_from_moves = self._identify_opening_from_moves(moves)
                if opening_from_moves != 'Unknown Opening':
                    return opening_from_moves
            
            # Last resort: return "Unknown Opening" instead of ECO code
            return 'Unknown Opening'
            
        except Exception:
            return 'Unknown Opening'
    
    def _identify_opening_from_moves(self, moves: List[str]) -> str:
        """
        Identify opening from move sequence using common patterns.
        
        Args:
            moves: List of moves in SAN notation
            
        Returns:
            Opening name or 'Unknown Opening'
        """
        if not moves or len(moves) < 2:
            return 'Unknown Opening'
        
        # Common opening patterns (first 2-4 moves)
        move_str = ' '.join(moves[:4]).lower()
        
        # Comprehensive opening database based on first moves
        opening_patterns = {
            # King's Pawn Openings (1.e4)
            'e4 e5': {
                'nf3 nc6': {
                    'bb5': 'Ruy Lopez',
                    'bc4': 'Italian Game',
                    'd4': 'Scotch Game',
                    'nc3': 'Four Knights Game',
                },
                'nf3 nf6': 'Petrov Defense',
                'f4': 'King\'s Gambit',
                'bc4': 'Bishop\'s Opening',
                'd4': 'Center Game',
                'nc3': 'Vienna Game',
            },
            'e4 c5': 'Sicilian Defense',
            'e4 e6': 'French Defense',
            'e4 c6': 'Caro-Kann Defense',
            'e4 d5': 'Scandinavian Defense',
            'e4 nf6': 'Alekhine Defense',
            'e4 d6': 'Pirc Defense',
            'e4 g6': 'Modern Defense',
            'e4 nc6': 'Nimzowitsch Defense',
            
            # Queen's Pawn Openings (1.d4)
            'd4 d5': {
                'c4': {
                    'e6': 'Queen\'s Gambit Declined',
                    'c6': 'Slav Defense',
                    'dxc4': 'Queen\'s Gambit Accepted',
                    'nf6': 'Queen\'s Gambit Declined',
                },
                'nf3 nf6': 'Queen\'s Pawn Game',
                'e3': 'Queen\'s Pawn Game',
                'bf4': 'London System',
            },
            'd4 nf6': {
                'c4 e6': 'Queen\'s Indian Defense',
                'c4 g6': 'King\'s Indian Defense',
                'c4 c5': 'Benoni Defense',
                'nf3': 'Indian Game',
                'bf4': 'London System',
            },
            'd4 f5': 'Dutch Defense',
            'd4 g6': 'King\'s Indian Defense',
            'd4 e6': 'Queen\'s Pawn Game',
            'd4 d6': 'Pirc Defense',
            
            # Other Openings
            'nf3 d5': 'Réti Opening',
            'nf3 nf6': 'Réti Opening',
            'c4 e5': 'English Opening',
            'c4 nf6': 'English Opening',
            'c4 c5': 'English Opening',
            'f4': 'Bird Opening',
            'b3': 'Larsen Opening',
            'nc3 d5': 'Dunst Opening',
            'e3': 'Van\'t Kruijs Opening',
            'g3': 'King\'s Fianchetto Opening',
        }
        
        # Try to match patterns with decreasing move counts
        for depth in [4, 3, 2]:
            test_moves = ' '.join(moves[:depth]).lower()
            
            # Check exact match first
            if test_moves in opening_patterns:
                result = opening_patterns[test_moves]
                if isinstance(result, str):
                    return result
                # Continue checking deeper if dict
                
            # Check nested patterns
            for pattern, value in opening_patterns.items():
                if test_moves.startswith(pattern):
                    if isinstance(value, str):
                        return value
                    elif isinstance(value, dict):
                        # Check next level
                        remaining = test_moves[len(pattern):].strip()
                        for sub_pattern, opening_name in value.items():
                            if remaining.startswith(sub_pattern):
                                if isinstance(opening_name, str):
                                    return opening_name
                                elif isinstance(opening_name, dict):
                                    # Check third level
                                    remaining2 = remaining[len(sub_pattern):].strip()
                                    for sub2_pattern, final_name in opening_name.items():
                                        if remaining2.startswith(sub2_pattern):
                                            return final_name
        
        return 'Unknown Opening'
    
    def _extract_termination(self, game: Dict) -> str:
        """
        Extract termination type from game data.
        
        Args:
            game: Game dictionary
            
        Returns:
            Termination type: 'checkmate', 'timeout', 'resignation', 'abandoned', 'agreed', 'repetition', 'insufficient', 'stalemate', 'other'
        """
        # Try to parse from PGN
        pgn_string = game.get('pgn', '')
        if pgn_string:
            try:
                pgn = StringIO(pgn_string)
                game_obj = chess.pgn.read_game(pgn)
                if game_obj:
                    termination = game_obj.headers.get('Termination', '').lower()
                    
                    if 'checkmate' in termination or 'won by checkmate' in termination:
                        return 'checkmate'
                    elif 'time' in termination or 'timeout' in termination:
                        return 'timeout'
                    elif 'resignation' in termination or 'resigned' in termination:
                        return 'resignation'
                    elif 'abandoned' in termination:
                        return 'abandoned'
                    elif 'agreement' in termination or 'agreed' in termination:
                        return 'agreed'
                    elif 'repetition' in termination:
                        return 'repetition'
                    elif 'insufficient' in termination:
                        return 'insufficient'
                    elif 'stalemate' in termination:
                        return 'stalemate'
            except Exception:
                pass
        
        return 'other'
    
    def _analyze_overall_performance(self, games: List[Dict]) -> Dict:
        """
        Analyze overall win/loss/draw performance over time.
        
        Returns daily aggregated statistics.
        """
        daily_stats = defaultdict(lambda: {'wins': 0, 'losses': 0, 'draws': 0})
        
        for game in games:
            date = game['date']
            result = game['result']
            
            if result == 'win':
                daily_stats[date]['wins'] += 1
            elif result in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                daily_stats[date]['losses'] += 1
            else:
                daily_stats[date]['draws'] += 1
        
        # Convert to list format
        daily_list = []
        for date in sorted(daily_stats.keys()):
            stats = daily_stats[date]
            daily_list.append({
                'date': date,
                'wins': stats['wins'],
                'losses': stats['losses'],
                'draws': stats['draws']
            })
        
        return {'daily_stats': daily_list}
    
    def _analyze_color_performance(self, games: List[Dict]) -> Dict:
        """Analyze performance by color (white vs black)."""
        white_daily = defaultdict(lambda: {'wins': 0, 'losses': 0, 'draws': 0})
        black_daily = defaultdict(lambda: {'wins': 0, 'losses': 0, 'draws': 0})
        
        white_total = {'wins': 0, 'losses': 0, 'draws': 0}
        black_total = {'wins': 0, 'losses': 0, 'draws': 0}
        
        for game in games:
            date = game['date']
            result = game['result']
            color = game['player_color']
            
            daily_dict = white_daily if color == 'white' else black_daily
            total_dict = white_total if color == 'white' else black_total
            
            if result == 'win':
                daily_dict[date]['wins'] += 1
                total_dict['wins'] += 1
            elif result in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                daily_dict[date]['losses'] += 1
                total_dict['losses'] += 1
            else:
                daily_dict[date]['draws'] += 1
                total_dict['draws'] += 1
        
        # Calculate win rates
        white_games = sum(white_total.values())
        black_games = sum(black_total.values())
        
        white_win_rate = (white_total['wins'] / white_games * 100) if white_games > 0 else 0
        black_win_rate = (black_total['wins'] / black_games * 100) if black_games > 0 else 0
        
        return {
            'white': {
                'daily_stats': [{'date': d, **white_daily[d]} for d in sorted(white_daily.keys())],
                'win_rate': round(white_win_rate, 2),
                'total': white_total
            },
            'black': {
                'daily_stats': [{'date': d, **black_daily[d]} for d in sorted(black_daily.keys())],
                'win_rate': round(black_win_rate, 2),
                'total': black_total
            }
        }
    
    def _analyze_elo_progression(self, games: List[Dict]) -> Dict:
        """Analyze Elo rating progression over time."""
        # Group by date and take the last rating of each day
        daily_ratings = {}
        
        for game in games:
            date = game['date']
            rating = game['player_rating']
            # Keep updating - the last game of the day will be the final value
            daily_ratings[date] = rating
        
        # Convert to list and sort by date
        data_points = [
            {'date': date, 'rating': rating}
            for date, rating in sorted(daily_ratings.items())
        ]
        
        # Calculate rating change
        rating_change = 0
        if len(data_points) >= 2:
            rating_change = data_points[-1]['rating'] - data_points[0]['rating']
        
        return {
            'data_points': data_points,
            'rating_change': rating_change
        }
    
    def _analyze_termination_wins(self, games: List[Dict]) -> Dict:
        """Analyze how player wins games."""
        termination_counts = defaultdict(int)
        total_wins = 0
        
        for game in games:
            if game['result'] == 'win':
                termination_counts[game['termination']] += 1
                total_wins += 1
        
        # Calculate percentages
        result = {}
        for termination, count in termination_counts.items():
            percentage = (count / total_wins * 100) if total_wins > 0 else 0
            result[termination] = {
                'count': count,
                'percentage': round(percentage, 2)
            }
        
        return result
    
    def _analyze_termination_losses(self, games: List[Dict]) -> Dict:
        """Analyze how player loses games."""
        termination_counts = defaultdict(int)
        total_losses = 0
        
        for game in games:
            if game['result'] in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                termination_counts[game['termination']] += 1
                total_losses += 1
        
        # Calculate percentages
        result = {}
        for termination, count in termination_counts.items():
            percentage = (count / total_losses * 100) if total_losses > 0 else 0
            result[termination] = {
                'count': count,
                'percentage': round(percentage, 2)
            }
        
        return result
    
    def _analyze_opening_performance(self, games: List[Dict]) -> Dict:
        """
        Analyze performance by chess opening.
        PRD v2.2: Changed to frequency-based analysis (top 10 most common openings).
        Removed best/worst categorization, 3-game minimum, and move sequence display.
        """
        opening_stats = defaultdict(lambda: {
            'wins': 0, 'losses': 0, 'draws': 0, 'games': 0
        })
        
        for game in games:
            opening = game['opening_name']
            if opening == 'Unknown':
                continue
            
            result = game['result']
            opening_stats[opening]['games'] += 1
            
            if result == 'win':
                opening_stats[opening]['wins'] += 1
            elif result in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                opening_stats[opening]['losses'] += 1
            else:
                opening_stats[opening]['draws'] += 1
        
        # PRD v2.2: Get all openings and sort by frequency (games played)
        all_openings = []
        for opening, stats in opening_stats.items():
            total = stats['games']
            win_rate = (stats['wins'] / total * 100) if total > 0 else 0
            
            all_openings.append({
                'name': opening,
                'games': stats['games'],
                'wins': stats['wins'],
                'losses': stats['losses'],
                'draws': stats['draws'],
                'win_rate': round(win_rate, 2)
            })
        
        # Sort by frequency (most played first)
        all_openings.sort(key=lambda x: x['games'], reverse=True)
        
        # Return top 10 most common openings
        top_common_openings = all_openings[:10]
        
        return {
            'top_common_openings': top_common_openings
        }
    
    def _extract_first_six_moves(self, pgn_string: str) -> str:
        """
        Extract first 6 moves (3 full moves) in standard chess notation.
        PRD v2.1: Format example: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6"
        
        Args:
            pgn_string: PGN string from game data
            
        Returns:
            String with first 6 moves in standard notation, or empty string if error
        """
        if not pgn_string:
            return ''
        
        try:
            pgn = StringIO(pgn_string)
            game = chess.pgn.read_game(pgn)
            
            if game is None:
                return ''
            
            board = game.board()
            moves = []
            move_number = 1
            
            for i, move in enumerate(list(game.mainline_moves())[:6]):
                san_move = board.san(move)
                
                # Add move number before White's move
                if i % 2 == 0:
                    moves.append(f"{move_number}. {san_move}")
                else:
                    moves.append(san_move)
                    move_number += 1
                
                board.push(move)
            
            return ' '.join(moves)
            
        except Exception as e:
            logger.warning(f"Error extracting first 6 moves: {e}")
            return ''
    
    def _analyze_opponent_strength(self, games: List[Dict]) -> Dict:
        """Analyze performance against opponents of different strengths."""
        categories = {
            'lower_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0},
            'similar_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0},
            'higher_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0}
        }
        
        for game in games:
            player_rating = game['player_rating']
            opponent_rating = game['opponent_rating']
            
            if not player_rating or not opponent_rating:
                continue
            
            # Calculate Elo differential
            elo_diff = opponent_rating - player_rating
            
            # Categorize
            if elo_diff < -100:
                category = 'lower_rated'
            elif -100 <= elo_diff <= 100:
                category = 'similar_rated'
            else:
                category = 'higher_rated'
            
            result = game['result']
            categories[category]['games'] += 1
            
            if result == 'win':
                categories[category]['wins'] += 1
            elif result in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                categories[category]['losses'] += 1
            else:
                categories[category]['draws'] += 1
        
        # Calculate win rates
        for category in categories.values():
            total = category['games']
            win_rate = (category['wins'] / total * 100) if total > 0 else 0
            category['win_rate'] = round(win_rate, 2)
        
        return categories
    
    def _analyze_time_of_day(self, games: List[Dict]) -> Dict:
        """Analyze performance by time of day."""
        periods = {
            'morning': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0},
            'afternoon': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0},
            'night': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0}
        }
        
        for game in games:
            period = game['time_of_day']
            result = game['result']
            
            periods[period]['games'] += 1
            
            if result == 'win':
                periods[period]['wins'] += 1
            elif result in ['checkmated', 'timeout', 'resigned', 'lose', 'abandoned']:
                periods[period]['losses'] += 1
            else:
                periods[period]['draws'] += 1
        
        # Calculate win rates
        for period in periods.values():
            total = period['games']
            win_rate = (period['wins'] / total * 100) if total > 0 else 0
            period['win_rate'] = round(win_rate, 2)
        
        return periods
    
    def _empty_analysis(self) -> Dict:
        """Return empty analysis structure."""
        return {
            'total_games': 0,
            'sections': {
                'overall_performance': {'daily_stats': []},
                'color_performance': {
                    'white': {'daily_stats': [], 'win_rate': 0, 'total': {'wins': 0, 'losses': 0, 'draws': 0}},
                    'black': {'daily_stats': [], 'win_rate': 0, 'total': {'wins': 0, 'losses': 0, 'draws': 0}}
                },
                'elo_progression': {'data_points': [], 'rating_change': 0},
                'termination_wins': {},
                'termination_losses': {},
                'opening_performance': {'best_openings': [], 'worst_openings': []},
                'opponent_strength': {
                    'lower_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0},
                    'similar_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0},
                    'higher_rated': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0}
                },
                'time_of_day': {
                    'morning': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0},
                    'afternoon': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0},
                    'night': {'wins': 0, 'losses': 0, 'draws': 0, 'games': 0, 'win_rate': 0}
                }
            }
        }
