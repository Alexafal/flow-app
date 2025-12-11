# Flow App - Troubleshooting Guide

## 🐛 Common Issues & Solutions

### Issue: "Onboarding buttons don't work" (Student, Fitness, etc.)

**Symptoms:**
- Click on Student/Fitness/Productivity buttons
- Nothing happens
- Doesn't go to next step

**Solutions:**

#### Solution 1: Install Dependencies
```bash
cd /Users/alexafal/Documents/Coding_Files/Python/Flow_App
pip3 install -r requirements.txt
# or
pip install -r requirements.txt
```

#### Solution 2: Check Server is Running
```bash
# Start the server
python3 app.py
# or
python app.py

# You should see:
# ==================================================
# Flow App - To-Do + Habit Tracker
# ==================================================
# Server starting on http://localhost:5000
```

#### Solution 3: Clear Browser Cache
- Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux)
- Or open in Incognito/Private mode

#### Solution 4: Check Browser Console
1. Open browser developer tools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for errors in red
4. Share the error message

---

### Issue: "Module 'flask' not found"

**Solution:**
```bash
pip3 install Flask Flask-CORS
# or use requirements.txt
pip3 install -r requirements.txt
```

---

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Option 1: The app will automatically use port 5001
# Just open http://localhost:5001

# Option 2: Stop the other process
# Find what's using port 5000
lsof -i :5000
# Kill it (replace PID with actual process ID)
kill -9 PID
```

---

### Issue: "Changes not showing up"

**Solutions:**
1. **Hard refresh:** `Cmd + Shift + R` or `Ctrl + Shift + R`
2. **Clear cache:** Browser settings → Clear cache
3. **Restart server:** Stop (Ctrl+C) and run `python3 app.py` again

---

### Issue: "JavaScript not loading"

**Check:**
1. Open http://localhost:5000
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh page
5. Look for failed requests (red)

**If files are 404:**
- Check that `static/js/` folder exists
- Check that all JS files are present (main.js, api.js, utils.js, icons.js)

---

### Issue: "White screen / nothing loads"

**Solutions:**
1. Check server terminal for Python errors
2. Check browser console for JavaScript errors
3. Try: `python3 app.py` instead of `python app.py`
4. Verify all files exist in correct locations

---

## 🔧 Quick Fixes

### Complete Setup (From Scratch)
```bash
# Navigate to project
cd /Users/alexafal/Documents/Coding_Files/Python/Flow_App

# Install dependencies
pip3 install -r requirements.txt

# Run server
python3 app.py

# Open browser
# Go to: http://localhost:5000
```

### Verify Installation
```bash
# Check Python
python3 --version  # Should be 3.7+

# Check Flask
python3 -c "import flask; print('Flask OK')"

# Check all dependencies
python3 -c "import flask, flask_cors; print('All dependencies OK')"
```

---

## 🎯 Testing the Fix

After fixing, test:
1. Open http://localhost:5000
2. Click on "Student" button
3. Should see console log: "Option card clicked: ..."
4. Should see console log: "Mode selected: student"
5. Should transition to step 2 (suggested habits)

If you see the console logs but nothing happens:
- Check `showOnboardingStep(2)` function
- Verify step 2 elements exist in HTML

---

## 💡 Debug Mode

Add this to see what's happening:

**In browser console:**
```javascript
// Check if FlowApp exists
console.log(window.flowApp);

// Check if buttons exist
console.log(document.querySelectorAll('.option-card').length);

// Manually trigger
window.flowApp.showOnboardingStep(2);
```

---

## 📞 Need More Help?

If none of these work:
1. Open browser console (F12)
2. Copy any error messages
3. Check server terminal for Python errors
4. Verify all files are present

---

## ✅ Expected Behavior

**Correct flow:**
1. Open app → See onboarding
2. Click "Student" → Console shows "Mode selected: student"
3. Immediately see step 2 (suggested habits)
4. Click habit or "Skip for now"
5. See step 3 (add first task)
6. Add task → Enter main app

**If this doesn't happen, something is blocking the flow.**

---

## 🚀 Fresh Start

If all else fails, fresh install:
```bash
cd /Users/alexafal/Documents/Coding_Files/Python/Flow_App

# Remove data
rm -rf data/

# Reinstall dependencies
pip3 uninstall flask flask-cors -y
pip3 install -r requirements.txt

# Run
python3 app.py

# Open browser in incognito mode
# Go to http://localhost:5000
```

---

This should fix the onboarding issue!

