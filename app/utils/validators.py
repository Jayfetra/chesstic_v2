"""
Input validation utilities.
"""
import re
from datetime import datetime, timedelta
from typing import Optional
import pytz


def validate_username(username: Optional[str]) -> bool:
    """
    Validate Chess.com username.
    
    Args:
        username: Username to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not username:
        return False
    
    # Chess.com usernames are alphanumeric with underscores and hyphens
    pattern = r'^[a-zA-Z0-9_-]{3,25}$'
    return bool(re.match(pattern, username))


def validate_date_range(start_date: Optional[str], end_date: Optional[str]) -> bool:
    """
    Validate date range.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        
    Returns:
        True if valid, False otherwise
    """
    if not start_date or not end_date:
        return False
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Ensure start is before end
        if start > end:
            return False
        
        # Ensure dates are not in the future
        if end > datetime.now():
            return False
        
        # PRD v2.2: Maximum 30 days enforced for performance
        if (end - start).days > 30:
            return False
        
        return True
        
    except ValueError:
        return False


def get_date_range_error(start_date: Optional[str], end_date: Optional[str]) -> Optional[str]:
    """
    Get specific error message for date range validation.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        
    Returns:
        Error message string if invalid, None if valid
    """
    if not start_date or not end_date:
        return "Both start and end dates are required"
    
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Ensure start is before end
        if start > end:
            return "Start date must be before end date"
        
        # Ensure dates are not in the future
        if end > datetime.now():
            return "End date cannot be in the future"
        
        # PRD v2.2: Maximum 30 days enforced for performance
        days_diff = (end - start).days
        if days_diff > 30:
            return "Please select a date range of 30 days or less. For best results, use 'Last 7 days' or 'Last 30 days'."
        
        return None
        
    except ValueError:
        return "Invalid date format. Please use YYYY-MM-DD format"


def validate_timezone(timezone_str: Optional[str]) -> bool:
    """
    Validate timezone string.
    
    Args:
        timezone_str: Timezone string to validate (e.g., 'America/New_York')
        
    Returns:
        True if valid, False otherwise
    """
    if not timezone_str:
        return False
    
    try:
        pytz.timezone(timezone_str)
        return True
    except pytz.exceptions.UnknownTimeZoneError:
        return False
