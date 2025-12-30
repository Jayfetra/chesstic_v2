"""
View routes for rendering HTML templates.
"""
from flask import render_template
from app.routes import main_bp


@main_bp.route('/')
def index():
    """Render the analytics dashboard as the main page."""
    return render_template('analytics.html')

