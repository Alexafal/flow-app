"""
Flow App - To-Do + Habit Tracker
A beautiful, minimal productivity app
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os

# Initialize Flask app
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__,
            template_folder=os.path.join(basedir, 'templates'),
            static_folder=os.path.join(basedir, 'static'))

CORS(app)

# Data storage file
DATA_FILE = os.path.join(basedir, 'data', 'flow_data.json')

def ensure_data_dir():
    """Ensure data directory exists"""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump({
                'tasks': [],
                'habits': [],
                'focus_items': [],
                'stats': {},
                'onboarding_complete': False,
                'settings': {
                    'theme': 'auto',
                    'calendar_view': 'day',
                    'default_task_duration': 30
                }
            }, f)

def load_data():
    """Load data from JSON file"""
    ensure_data_dir()
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except:
        return {
            'tasks': [],
            'habits': [],
            'focus_items': [],
            'stats': {},
            'onboarding_complete': False
        }

def save_data(data):
    """Save data to JSON file"""
    ensure_data_dir()
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# ============================================
# ROUTES
# ============================================

@app.route('/')
def index():
    """Main app page"""
    return render_template('index.html')

# ============================================
# TASKS API
# ============================================

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    data = load_data()
    return jsonify(data.get('tasks', [])), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = load_data()
    task_data = request.get_json()
    
    # Generate ID
    task_id = max([t.get('id', 0) for t in data.get('tasks', [])] + [0]) + 1
    
    task = {
        'id': task_id,
        'title': task_data.get('title', ''),
        'completed': False,
        'due_date': task_data.get('due_date'),
        'due_time': task_data.get('due_time'),
        'duration': task_data.get('duration', 30),  # minutes
        'priority': task_data.get('priority', 'normal'),
        'auto_priority': 0,  # calculated priority
        'created_at': datetime.now().isoformat(),
        'completed_at': None,
        'postponed_count': 0,
        'subtasks': []
    }
    
    data['tasks'].append(task)
    save_data(data)
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = load_data()
    task_data = request.get_json()
    
    for task in data['tasks']:
        if task['id'] == task_id:
            task.update(task_data)
            if task_data.get('completed'):
                task['completed_at'] = datetime.now().isoformat()
            save_data(data)
            return jsonify(task), 200
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    data = load_data()
    data['tasks'] = [t for t in data['tasks'] if t['id'] != task_id]
    save_data(data)
    return jsonify({'message': 'Task deleted'}), 200

@app.route('/api/tasks/reorder', methods=['POST'])
def reorder_tasks():
    """Reorder tasks"""
    data = load_data()
    task_ids = request.get_json().get('task_ids', [])
    
    # Create a mapping of id to task
    task_map = {t['id']: t for t in data['tasks']}
    
    # Reorder based on provided IDs
    data['tasks'] = [task_map[id] for id in task_ids if id in task_map]
    save_data(data)
    return jsonify({'message': 'Tasks reordered'}), 200

# ============================================
# HABITS API
# ============================================

@app.route('/api/habits', methods=['GET'])
def get_habits():
    """Get all habits"""
    data = load_data()
    return jsonify(data.get('habits', [])), 200

@app.route('/api/habits', methods=['POST'])
def create_habit():
    """Create a new habit"""
    data = load_data()
    habit_data = request.get_json()
    
    habit_id = max([h.get('id', 0) for h in data.get('habits', [])] + [0]) + 1
    
    habit = {
        'id': habit_id,
        'name': habit_data.get('name', ''),
        'icon': habit_data.get('icon', '✨'),
        'frequency': habit_data.get('frequency', 'daily'),  # daily, weekly, custom
        'frequency_count': habit_data.get('frequency_count', 1),  # X times per week
        'streak': 0,
        'longest_streak': 0,
        'completions': {},  # {date: true}
        'best_time': None,
        'paused': False,
        'created_at': datetime.now().isoformat()
    }
    
    data['habits'].append(habit)
    save_data(data)
    return jsonify(habit), 201

@app.route('/api/habits/<int:habit_id>/complete', methods=['POST'])
def complete_habit(habit_id):
    """Mark habit as complete for today"""
    data = load_data()
    today = datetime.now().date().isoformat()
    
    for habit in data['habits']:
        if habit['id'] == habit_id:
            if not habit['completions'].get(today, False):
                habit['completions'][today] = True
                # Calculate streak
                habit['streak'] = calculate_streak(habit['completions'])
                longest = calculate_longest_streak(habit['completions'])
                habit['longest_streak'] = max(habit.get('longest_streak', 0), longest)
                save_data(data)
                return jsonify(habit), 200
    
    return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/habits/<int:habit_id>/uncomplete', methods=['POST'])
def uncomplete_habit(habit_id):
    """Unmark habit as complete for today"""
    data = load_data()
    today = datetime.now().date().isoformat()
    
    for habit in data['habits']:
        if habit['id'] == habit_id:
            if habit['completions'].get(today, False):
                del habit['completions'][today]
                habit['streak'] = calculate_streak(habit['completions'])
                save_data(data)
                return jsonify(habit), 200
    
    return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Delete a habit"""
    data = load_data()
    data['habits'] = [h for h in data['habits'] if h['id'] != habit_id]
    save_data(data)
    return jsonify({'message': 'Habit deleted'}), 200

def calculate_streak(completions):
    """Calculate current streak from completions"""
    if not completions:
        return 0
    
    dates = sorted([d for d, completed in completions.items() if completed], reverse=True)
    if not dates:
        return 0
    
    streak = 0
    current_date = datetime.now().date()
    
    for date_str in dates:
        date = datetime.fromisoformat(date_str).date()
        expected_date = current_date - timedelta(days=streak)
        
        if date == expected_date:
            streak += 1
        elif date < expected_date:
            break
        else:
            # If date is in future, reset
            streak = 1
            current_date = date
    
    return streak

def calculate_longest_streak(completions):
    """Calculate longest streak ever"""
    if not completions:
        return 0
    
    dates = sorted([datetime.fromisoformat(d).date() for d, v in completions.items() if v])
    if not dates:
        return 0
    
    longest = 1
    current = 1
    
    for i in range(1, len(dates)):
        if (dates[i] - dates[i-1]).days == 1:
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    
    return longest

# ============================================
# FOCUS MODE API
# ============================================

@app.route('/api/focus', methods=['GET'])
def get_focus_items():
    """Get today's focus items"""
    data = load_data()
    today = datetime.now().date().isoformat()
    
    # Get focus items for today
    focus_items = data.get('focus_items', [])
    today_focus = [f for f in focus_items if f.get('date') == today]
    
    return jsonify(today_focus), 200

@app.route('/api/focus', methods=['POST'])
def set_focus_items():
    """Set today's focus items (max 3)"""
    data = load_data()
    focus_data = request.get_json()
    items = focus_data.get('items', [])[:3]  # Max 3 items
    
    today = datetime.now().date().isoformat()
    
    # Remove old focus items for today
    data['focus_items'] = [f for f in data.get('focus_items', []) if f.get('date') != today]
    
    # Add new focus items
    for i, item in enumerate(items):
        data['focus_items'].append({
            'id': len(data.get('focus_items', [])) + i + 1,
            'text': item,
            'date': today,
            'completed': False
        })
    
    save_data(data)
    return jsonify(data['focus_items'][-len(items):]), 201

@app.route('/api/focus/<int:focus_id>/complete', methods=['POST'])
def complete_focus_item(focus_id):
    """Mark focus item as complete"""
    data = load_data()
    
    for item in data.get('focus_items', []):
        if item['id'] == focus_id:
            item['completed'] = True
            save_data(data)
            return jsonify(item), 200
    
    return jsonify({'error': 'Focus item not found'}), 404

# ============================================
# STATS API
# ============================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get user statistics"""
    data = load_data()
    today = datetime.now().date().isoformat()
    
    # Calculate stats
    tasks = data.get('tasks', [])
    habits = data.get('habits', [])
    
    today_tasks = [t for t in tasks if t.get('completed') and 
                   (t.get('completed_at', '')[:10] == today if t.get('completed_at') else False)]
    
    completed_habits_today = sum(1 for h in habits if h.get('completions', {}).get(today, False))
    
    stats = {
        'tasks_completed_today': len(today_tasks),
        'habits_completed_today': completed_habits_today,
        'total_tasks_completed': sum(1 for t in tasks if t.get('completed')),
        'longest_streak': max([h.get('streak', 0) for h in habits] + [0]),
        'perfect_days': calculate_perfect_days(data),
        'weekly_completion': get_weekly_completion(data)
    }
    
    return jsonify(stats), 200

def calculate_perfect_days(data):
    """Calculate number of perfect days (all tasks and habits completed)"""
    perfect_count = 0
    tasks = data.get('tasks', [])
    habits = data.get('habits', [])
    
    # Get all dates with activity
    dates = set()
    for task in tasks:
        if task.get('completed_at'):
            dates.add(task['completed_at'][:10])
    for habit in habits:
        if habit.get('completions'):
            dates.update(habit['completions'].keys())
    
    # Check each date for perfection
    for date_str in dates:
        date_tasks = [t for t in tasks if t.get('due_date') == date_str or 
                     (t.get('completed_at', '')[:10] == date_str)]
        if not date_tasks:
            continue
        
        all_tasks_done = all(t.get('completed') for t in date_tasks)
        habits_done = sum(1 for h in habits if h.get('completions', {}).get(date_str, False))
        
        if all_tasks_done and len(date_tasks) > 0 and habits_done >= len(habits) * 0.8:
            perfect_count += 1
    
    return perfect_count

def get_weekly_completion(data):
    """Get weekly completion data for heatmap"""
    today = datetime.now().date()
    week_data = []
    
    for i in range(7):
        date = today - timedelta(days=6-i)
        date_str = date.isoformat()
        
        tasks = data.get('tasks', [])
        habits = data.get('habits', [])
        
        tasks_completed = sum(1 for t in tasks if t.get('completed') and 
                            t.get('completed_at', '')[:10] == date_str)
        habits_completed = sum(1 for h in habits if h.get('completions', {}).get(date_str, False))
        
        week_data.append({
            'date': date_str,
            'tasks': tasks_completed,
            'habits': habits_completed,
            'total': tasks_completed + habits_completed
        })
    
    return week_data

def get_smart_praise(data):
    """Generate contextual praise message"""
    today = datetime.now().date().isoformat()
    tasks = data.get('tasks', [])
    habits = data.get('habits', [])
    
    # Check completion streak
    streak_days = 0
    current_date = datetime.now().date()
    for i in range(30):
        date_str = (current_date - timedelta(days=i)).isoformat()
        date_tasks = [t for t in tasks if t.get('completed_at', '')[:10] == date_str]
        if len(date_tasks) > 0:
            streak_days += 1
        else:
            break
    
    # Get today's progress
    today_tasks = [t for t in tasks if not t.get('due_date') or t.get('due_date') <= today]
    completed_today = sum(1 for t in today_tasks if t.get('completed'))
    
    # Generate contextual message
    if completed_today == len(today_tasks) and len(today_tasks) > 0:
        if streak_days >= 7:
            return f"{streak_days} days in a row. That's discipline."
        elif streak_days >= 3:
            return "You're building real momentum."
        else:
            return "Perfect day! You're on fire! 🔥"
    elif completed_today > 0:
        progress = int((completed_today / len(today_tasks)) * 100) if today_tasks else 0
        if progress >= 75:
            return "Almost there! Finish strong."
        elif progress >= 50:
            return "You're halfway there. Keep going!"
        else:
            return "Small steps today = big results tomorrow."
    else:
        return "Every journey starts with a single step."

def detect_patterns(data):
    """Detect user patterns and provide insights"""
    habits = data.get('habits', [])
    tasks = data.get('tasks', [])
    insights = []
    
    # Analyze habit completion times
    for habit in habits:
        if habit.get('completions'):
            completion_dates = [d for d, completed in habit['completions'].items() if completed]
            if len(completion_dates) >= 5:
                # Check for streak
                if habit.get('streak', 0) >= 7:
                    insights.append({
                        'type': 'celebration',
                        'message': f"Amazing! {habit['streak']} day streak on '{habit['name']}'"
                    })
    
    # Check for skipped tasks
    overdue_tasks = [t for t in tasks if not t.get('completed') and 
                    t.get('due_date') and t['due_date'] < datetime.now().date().isoformat()]
    
    for task in overdue_tasks:
        # Check how many days overdue
        due_date = datetime.fromisoformat(task['due_date']).date()
        days_overdue = (datetime.now().date() - due_date).days
        
        if days_overdue >= 3:
            insights.append({
                'type': 'suggestion',
                'task_id': task['id'],
                'message': f"'{task['title']}' has been pending for {days_overdue} days. Break it into smaller steps?"
            })
    
    return insights

# ============================================
# MOTIVATION & INTELLIGENCE API
# ============================================

@app.route('/api/praise', methods=['GET'])
def get_praise():
    """Get smart contextual praise message"""
    data = load_data()
    message = get_smart_praise(data)
    return jsonify({'message': message}), 200

@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Get pattern-based insights and suggestions"""
    data = load_data()
    insights = detect_patterns(data)
    return jsonify({'insights': insights}), 200

@app.route('/api/tasks/<int:task_id>/snooze', methods=['POST'])
def snooze_task(task_id):
    """Snooze a task to tomorrow"""
    data = load_data()
    snooze_data = request.get_json() or {}
    days = snooze_data.get('days', 1)
    
    for task in data['tasks']:
        if task['id'] == task_id:
            # Move due date forward
            if task.get('due_date'):
                current_date = datetime.fromisoformat(task['due_date'])
            else:
                current_date = datetime.now()
            
            new_date = current_date + timedelta(days=days)
            task['due_date'] = new_date.date().isoformat()
            save_data(data)
            return jsonify(task), 200
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/reflection', methods=['POST'])
def save_reflection():
    """Save end-of-day reflection"""
    data = load_data()
    reflection_data = request.get_json()
    
    today = datetime.now().date().isoformat()
    
    if 'reflections' not in data:
        data['reflections'] = {}
    
    data['reflections'][today] = {
        'what_went_well': reflection_data.get('what_went_well', ''),
        'grateful_for': reflection_data.get('grateful_for', ''),
        'energy_level': reflection_data.get('energy_level', 5),
        'timestamp': datetime.now().isoformat()
    }
    
    save_data(data)
    return jsonify({'message': 'Reflection saved'}), 201

@app.route('/api/reflection', methods=['GET'])
def get_reflections():
    """Get recent reflections"""
    data = load_data()
    reflections = data.get('reflections', {})
    
    # Get last 7 days
    recent = {}
    for i in range(7):
        date = (datetime.now().date() - timedelta(days=i)).isoformat()
        if date in reflections:
            recent[date] = reflections[date]
    
    return jsonify(recent), 200

@app.route('/api/weekly-review', methods=['GET'])
def get_weekly_review():
    """Get weekly review data"""
    data = load_data()
    
    # Calculate week stats
    week_start = datetime.now().date() - timedelta(days=7)
    tasks = data.get('tasks', [])
    habits = data.get('habits', [])
    
    # Tasks completed this week
    week_tasks = [t for t in tasks if t.get('completed_at') and 
                  t['completed_at'][:10] >= week_start.isoformat()]
    
    # Habit completions this week
    week_habits_count = 0
    for habit in habits:
        for i in range(7):
            date = (datetime.now().date() - timedelta(days=i)).isoformat()
            if habit.get('completions', {}).get(date, False):
                week_habits_count += 1
    
    # Get streaks
    current_streaks = [h.get('streak', 0) for h in habits]
    
    review = {
        'tasks_completed': len(week_tasks),
        'habits_completed': week_habits_count,
        'current_streaks': current_streaks,
        'longest_streak': max(current_streaks) if current_streaks else 0,
        'perfect_days': calculate_perfect_days(data),
        'weekly_completion': get_weekly_completion(data),
        'insights': detect_patterns(data),
        'motivation_message': get_weekly_motivation(data)
    }
    
    return jsonify(review), 200

def get_weekly_motivation(data):
    """Generate weekly motivation message"""
    tasks = data.get('tasks', [])
    habits = data.get('habits', [])
    
    week_start = datetime.now().date() - timedelta(days=7)
    week_tasks = [t for t in tasks if t.get('completed_at') and 
                  t['completed_at'][:10] >= week_start.isoformat()]
    
    if len(week_tasks) >= 20:
        return "Incredible week! You're crushing your goals. 💪"
    elif len(week_tasks) >= 10:
        return "Solid week! You're making real progress. 🌟"
    elif len(week_tasks) >= 5:
        return "Good start! Keep building momentum. 🚀"
    else:
        return "Every week is a fresh start. You've got this! ✨"

# ============================================
# CALENDAR API
# ============================================

@app.route('/api/calendar/<view_type>', methods=['GET'])
def get_calendar_view(view_type):
    """Get calendar data for day/week/month view"""
    data = load_data()
    date_param = request.args.get('date', datetime.now().date().isoformat())
    target_date = datetime.fromisoformat(date_param).date()
    
    if view_type == 'day':
        return jsonify(get_day_view(data, target_date)), 200
    elif view_type == 'week':
        return jsonify(get_week_view(data, target_date)), 200
    elif view_type == 'month':
        return jsonify(get_month_view(data, target_date)), 200
    else:
        return jsonify({'error': 'Invalid view type'}), 400

def get_day_view(data, date):
    """Get all tasks and habits for a specific day"""
    date_str = date.isoformat()
    
    tasks = [t for t in data.get('tasks', []) if t.get('due_date') == date_str]
    habits = data.get('habits', [])
    
    # Get habit completions for this day
    habit_items = []
    for habit in habits:
        if habit.get('frequency') == 'daily' or should_show_habit(habit, date):
            habit_items.append({
                'id': habit['id'],
                'name': habit['name'],
                'icon': habit['icon'],
                'completed': habit.get('completions', {}).get(date_str, False),
                'type': 'habit'
            })
    
    return {
        'date': date_str,
        'tasks': tasks,
        'habits': habit_items,
        'focus_items': [f for f in data.get('focus_items', []) if f.get('date') == date_str]
    }

def get_week_view(data, date):
    """Get week overview starting from Monday"""
    # Find Monday of the week
    monday = date - timedelta(days=date.weekday())
    week_data = []
    
    for i in range(7):
        day = monday + timedelta(days=i)
        day_data = get_day_view(data, day)
        day_data['day_name'] = day.strftime('%A')
        day_data['task_count'] = len(day_data['tasks'])
        day_data['habit_count'] = len([h for h in day_data['habits'] if h['completed']])
        week_data.append(day_data)
    
    return {
        'week_start': monday.isoformat(),
        'days': week_data
    }

def get_month_view(data, date):
    """Get month overview"""
    # Get first day of month
    first_day = date.replace(day=1)
    # Get last day of month
    if first_day.month == 12:
        last_day = first_day.replace(year=first_day.year + 1, month=1) - timedelta(days=1)
    else:
        last_day = first_day.replace(month=first_day.month + 1) - timedelta(days=1)
    
    month_data = []
    current = first_day
    
    while current <= last_day:
        tasks = [t for t in data.get('tasks', []) if t.get('due_date') == current.isoformat()]
        habits = data.get('habits', [])
        habit_completions = sum(1 for h in habits if h.get('completions', {}).get(current.isoformat(), False))
        
        month_data.append({
            'date': current.isoformat(),
            'day': current.day,
            'task_count': len(tasks),
            'completed_tasks': len([t for t in tasks if t.get('completed')]),
            'habit_completions': habit_completions
        })
        current += timedelta(days=1)
    
    return {
        'month': first_day.month,
        'year': first_day.year,
        'days': month_data
    }

def should_show_habit(habit, date):
    """Determine if habit should show on given date based on frequency"""
    if habit.get('frequency') == 'daily':
        return True
    elif habit.get('frequency') == 'weekly':
        # Show on specific day of week (could be enhanced)
        return date.weekday() == 0  # Monday for now
    return False

# ============================================
# SMART RESCHEDULING API
# ============================================

@app.route('/api/tasks/<int:task_id>/reschedule-suggestions', methods=['GET'])
def get_reschedule_suggestions(task_id):
    """Get smart rescheduling suggestions for a task"""
    data = load_data()
    task = next((t for t in data['tasks'] if t['id'] == task_id), None)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    suggestions = generate_reschedule_suggestions(task, data)
    return jsonify({'suggestions': suggestions}), 200

def generate_reschedule_suggestions(task, data):
    """Generate smart reschedule suggestions"""
    suggestions = []
    now = datetime.now()
    
    # Tomorrow morning
    tomorrow = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    suggestions.append({
        'date': tomorrow.date().isoformat(),
        'time': '09:00',
        'label': 'Tomorrow morning',
        'reason': 'Fresh start to the day'
    })
    
    # This evening
    if now.hour < 18:
        today_evening = now.replace(hour=18, minute=0, second=0, microsecond=0)
        suggestions.append({
            'date': today_evening.date().isoformat(),
            'time': '18:00',
            'label': 'This evening',
            'reason': 'Complete before day ends'
        })
    
    # Next Monday (if applicable)
    days_until_monday = (7 - now.weekday()) % 7
    if days_until_monday == 0:
        days_until_monday = 7
    next_monday = (now + timedelta(days=days_until_monday)).replace(hour=9, minute=0)
    suggestions.append({
        'date': next_monday.date().isoformat(),
        'time': '09:00',
        'label': 'Next Monday',
        'reason': 'Start of new week'
    })
    
    # Based on past completion patterns
    completed_tasks = [t for t in data.get('tasks', []) if t.get('completed') and t.get('completed_at')]
    if completed_tasks:
        # Find most productive hour
        hours = [datetime.fromisoformat(t['completed_at']).hour for t in completed_tasks[-10:]]
        if hours:
            most_productive_hour = max(set(hours), key=hours.count)
            tomorrow_productive = (now + timedelta(days=1)).replace(hour=most_productive_hour, minute=0)
            suggestions.append({
                'date': tomorrow_productive.date().isoformat(),
                'time': f'{most_productive_hour:02d}:00',
                'label': 'Your productive time',
                'reason': f'You often complete tasks at {most_productive_hour}:00'
            })
    
    return suggestions

@app.route('/api/tasks/<int:task_id>/reschedule', methods=['POST'])
def reschedule_task(task_id):
    """Reschedule a task with new date/time"""
    data = load_data()
    reschedule_data = request.get_json()
    
    for task in data['tasks']:
        if task['id'] == task_id:
            task['due_date'] = reschedule_data.get('date')
            task['due_time'] = reschedule_data.get('time')
            task['postponed_count'] = task.get('postponed_count', 0) + 1
            save_data(data)
            return jsonify(task), 200
    
    return jsonify({'error': 'Task not found'}), 404

# ============================================
# TASK BREAKDOWN API
# ============================================

@app.route('/api/tasks/<int:task_id>/breakdown', methods=['POST'])
def create_task_breakdown(task_id):
    """Break down a task into subtasks"""
    data = load_data()
    breakdown_data = request.get_json()
    
    for task in data['tasks']:
        if task['id'] == task_id:
            subtasks = breakdown_data.get('subtasks', [])
            task['subtasks'] = [{'text': st, 'completed': False} for st in subtasks]
            save_data(data)
            return jsonify(task), 200
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>/breakdown-suggestions', methods=['GET'])
def get_breakdown_suggestions(task_id):
    """Get AI-like suggestions for breaking down a task"""
    data = load_data()
    task = next((t for t in data['tasks'] if t['id'] == task_id), None)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Simple rule-based suggestions
    title = task['title'].lower()
    suggestions = []
    
    if 'study' in title or 'learn' in title:
        suggestions = [
            'Review materials',
            'Take notes',
            'Practice exercises',
            'Review and summarize'
        ]
    elif 'write' in title or 'report' in title:
        suggestions = [
            'Create outline',
            'Draft first section',
            'Complete draft',
            'Review and edit'
        ]
    elif 'project' in title:
        suggestions = [
            'Plan approach',
            'Gather resources',
            'Execute main work',
            'Test and finalize'
        ]
    else:
        suggestions = [
            'Preparation',
            'Main work',
            'Review',
            'Completion'
        ]
    
    return jsonify({'suggestions': suggestions}), 200

# ============================================
# HABIT INSIGHTS API
# ============================================

@app.route('/api/habits/<int:habit_id>/insights', methods=['GET'])
def get_habit_insights(habit_id):
    """Get detailed insights for a specific habit"""
    data = load_data()
    habit = next((h for h in data.get('habits', []) if h['id'] == habit_id), None)
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    insights = calculate_habit_insights(habit)
    return jsonify(insights), 200

def calculate_habit_insights(habit):
    """Calculate detailed habit insights"""
    completions = habit.get('completions', {})
    if not completions:
        return {'message': 'No data yet', 'insights': []}
    
    # Get completion dates
    completed_dates = [datetime.fromisoformat(d).date() for d, v in completions.items() if v]
    if not completed_dates:
        return {'message': 'No completions yet', 'insights': []}
    
    completed_dates.sort()
    
    # Day of week analysis
    weekday_counts = {}
    for date in completed_dates:
        weekday = date.strftime('%A')
        weekday_counts[weekday] = weekday_counts.get(weekday, 0) + 1
    
    best_day = max(weekday_counts.items(), key=lambda x: x[1])[0] if weekday_counts else None
    worst_day = min(weekday_counts.items(), key=lambda x: x[1])[0] if weekday_counts else None
    
    # Recent performance
    last_7_days = [(datetime.now().date() - timedelta(days=i)).isoformat() for i in range(7)]
    recent_completion = sum(1 for d in last_7_days if completions.get(d, False))
    recent_percentage = int((recent_completion / 7) * 100)
    
    # Streak analysis
    current_streak = habit.get('streak', 0)
    longest_streak = habit.get('longest_streak', current_streak)
    
    return {
        'total_completions': len(completed_dates),
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'best_day': best_day,
        'worst_day': worst_day,
        'recent_7_days': recent_completion,
        'recent_percentage': recent_percentage,
        'weekday_breakdown': weekday_counts,
        'insights': generate_habit_insight_messages(habit, weekday_counts, recent_percentage, current_streak)
    }

def generate_habit_insight_messages(habit, weekday_counts, recent_percentage, streak):
    """Generate insight messages"""
    messages = []
    
    if recent_percentage >= 85:
        messages.append({
            'type': 'success',
            'message': f"Outstanding! You've kept up with '{habit['name']}' {recent_percentage}% this week."
        })
    elif recent_percentage >= 60:
        messages.append({
            'type': 'good',
            'message': f"Good progress on '{habit['name']}'.  Keep pushing!"
        })
    else:
        messages.append({
            'type': 'encourage',
            'message': f"Don't give up on '{habit['name']}'. Every day is a new chance."
        })
    
    if weekday_counts:
        best_day = max(weekday_counts.items(), key=lambda x: x[1])[0]
        messages.append({
            'type': 'pattern',
            'message': f"You're most consistent on {best_day}s."
        })
    
    if streak >= 7:
        messages.append({
            'type': 'celebration',
            'message': f"🔥 {streak} day streak! You're building real discipline."
        })
    
    return messages

# ============================================
# PRIORITY & AGING API
# ============================================

@app.route('/api/tasks/aging', methods=['GET'])
def get_aging_tasks():
    """Get tasks that have been pending too long"""
    data = load_data()
    aging_tasks = []
    today = datetime.now().date()
    
    for task in data.get('tasks', []):
        if task.get('completed'):
            continue
        
        created = datetime.fromisoformat(task['created_at']).date()
        days_old = (today - created).days
        
        if days_old >= 3:
            aging_tasks.append({
                'id': task['id'],
                'title': task['title'],
                'days_old': days_old,
                'created_at': task['created_at'],
                'postponed_count': task.get('postponed_count', 0)
            })
    
    return jsonify({'aging_tasks': aging_tasks}), 200

@app.route('/api/tasks/prioritize', methods=['POST'])
def auto_prioritize_tasks():
    """Automatically prioritize tasks based on behavior"""
    data = load_data()
    
    # Simple priority scoring
    for task in data['tasks']:
        if task.get('completed'):
            continue
        
        score = 0
        
        # Age factor
        created = datetime.fromisoformat(task['created_at']).date()
        days_old = (datetime.now().date() - created).days
        score += min(days_old * 2, 20)
        
        # Due date factor
        if task.get('due_date'):
            due = datetime.fromisoformat(task['due_date']).date()
            days_until = (due - datetime.now().date()).days
            if days_until < 0:
                score += 30  # Overdue
            elif days_until == 0:
                score += 25  # Due today
            elif days_until <= 2:
                score += 15
        
        # Manual priority
        if task.get('priority') == 'high':
            score += 20
        elif task.get('priority') == 'normal':
            score += 10
        
        # Postpone penalty
        score -= task.get('postponed_count', 0) * 5
        
        task['auto_priority'] = max(score, 0)
    
    # Sort by priority
    data['tasks'] = sorted(data.get('tasks', []), 
                          key=lambda t: t.get('auto_priority', 0), 
                          reverse=True)
    
    save_data(data)
    return jsonify({'message': 'Tasks prioritized'}), 200

# ============================================
# SETTINGS API
# ============================================

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get user settings"""
    data = load_data()
    return jsonify(data.get('settings', {})), 200

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update user settings"""
    data = load_data()
    settings_data = request.get_json()
    
    if 'settings' not in data:
        data['settings'] = {}
    
    data['settings'].update(settings_data)
    save_data(data)
    return jsonify(data['settings']), 200

# ============================================
# ONBOARDING API
# ============================================

@app.route('/api/onboarding', methods=['GET'])
def get_onboarding_status():
    """Get onboarding status"""
    data = load_data()
    return jsonify({'complete': data.get('onboarding_complete', False)}), 200

@app.route('/api/onboarding/complete', methods=['POST'])
def complete_onboarding():
    """Mark onboarding as complete"""
    data = load_data()
    data['onboarding_complete'] = True
    save_data(data)
    return jsonify({'message': 'Onboarding completed'}), 200

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    ensure_data_dir()
    import socket
    
    def is_port_available(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) != 0
    
    # Check if port 5000 is available
    if is_port_available(5000):
        port = 5000
    else:
        port = 5001
        print("⚠️  Port 5000 is in use, using port 5001 instead")
    
    print("=" * 50)
    print("Flow App - To-Do + Habit Tracker")
    print("=" * 50)
    print(f"Server starting on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=port)

