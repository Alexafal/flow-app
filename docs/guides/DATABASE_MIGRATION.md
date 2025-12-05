# Database Migration Guide

Step-by-step guide to migrate from JSON to PostgreSQL.

---

## 🎯 **What This Does:**

Upgrades your Flow app from:
- ❌ JSON file (data lost on restart)
- ✅ PostgreSQL database (data persists forever!)

---

## 📋 **Prerequisites:**

- [x] Render account
- [x] Flow app deployed on Render
- [x] 15 minutes

---

## 🚀 **Step-by-Step Migration:**

### **Step 1: Create PostgreSQL Database (5 min)**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   ```
   Name: flow-db
   Database: flow
   User: flow_user
   Region: Oregon (or same as your app)
   PostgreSQL Version: 15
   Plan: Free
   ```
4. Click **"Create Database"**
5. Wait 1-2 minutes for creation
6. **Copy "Internal Database URL"** (looks like: `postgres://...`)

---

### **Step 2: Add Database URL to App (2 min)**

1. Go to your **flow-app** service in Render
2. Click **"Environment"** in left sidebar
3. Click **"Add Environment Variable"**
4. Add:
   ```
   Key: DATABASE_URL
   Value: [paste the Internal Database URL]
   ```
5. Click **"Save Changes"**

---

### **Step 3: Update Code (Already Done!)**

The following files have been created/updated:
- ✅ `database.py` - Database models and operations
- ✅ `requirements.txt` - Added PostgreSQL dependencies
- ✅ `app.py` - Will be updated next

---

### **Step 4: Push Changes**

```bash
cd "/Users/alexafal/Documents/Coding_Files/Python/Flow_App"

# Add all changes
git add .

# Commit
git commit -m "Add PostgreSQL database support"

# Push to GitHub
git push origin main
```

---

### **Step 5: Wait for Deployment**

1. Go to Render dashboard
2. Watch the deploy logs
3. Look for:
   ```
   ✅ Database connected!
   ✅ Database tables created/verified
   ```
4. Wait 2-3 minutes for deploy to complete

---

### **Step 6: Test**

1. Open your Render URL
2. Add a task or habit
3. **Restart your app** (Render dashboard → Manual Deploy)
4. Open again
5. **Your data should still be there!** 🎉

---

## 🔄 **How It Works:**

### **Backward Compatible:**

```python
# With DATABASE_URL environment variable:
✅ Uses PostgreSQL (production)

# Without DATABASE_URL:
✅ Falls back to JSON (local development)
```

### **Development vs Production:**

**Local (your computer):**
- Uses `data/flow_data.json`
- No database needed
- Easy development

**Production (Render):**
- Uses PostgreSQL
- Data persists forever
- Automatic backups

---

## 📊 **Database Schema:**

### **Tasks Table:**
```sql
id, title, completed, due_date, due_time, 
created_at, completed_at, priority, tags, 
description, repeat_frequency, status, 
time_estimate, actual_time_spent
```

### **Habits Table:**
```sql
id, name, icon, streak, completions, 
frequency, frequency_count, category, 
created_at, archived
```

### **Focus Items Table:**
```sql
id, content, completed, created_at
```

### **Settings Table:**
```sql
id, key, value, updated_at
```

---

## 🔍 **Verify Database:**

### **Check Connection:**

In Render logs, you should see:
```
✅ Database connected!
✅ Database tables created/verified
```

### **Check Tables:**

In Render PostgreSQL dashboard:
1. Click your `flow-db` database
2. Click "Connect" → "External Connection"
3. Use a tool like pgAdmin or TablePlus to view tables

---

## 🐛 **Troubleshooting:**

### **Error: "no such table"**

**Cause:** Tables not created

**Fix:**
1. Check DATABASE_URL is set correctly
2. Redeploy app
3. Check logs for "Database tables created"

### **Error: "could not connect to server"**

**Cause:** Wrong DATABASE_URL

**Fix:**
1. Go to Render PostgreSQL dashboard
2. Copy "Internal Database URL" (not External!)
3. Update environment variable in app
4. Redeploy

### **Error: "relation already exists"**

**Fix:** This is fine! Tables already exist.

### **Data not saving**

**Check:**
1. DATABASE_URL environment variable is set
2. App restarted after adding DATABASE_URL
3. Render logs show "Database connected!"
4. No errors in logs

---

## 💾 **Backup & Restore:**

### **Backup (Important!):**

Render automatically backs up free PostgreSQL databases for 7 days.

**Manual backup:**
```bash
# From Render dashboard:
# PostgreSQL → Your Database → Backups
# Click "Create Backup"
```

### **Export Data:**

To download your data:
1. Render dashboard → flow-db
2. Connect → External Connection
3. Use pgAdmin to export as SQL or CSV

---

## 📈 **Free Tier Limits:**

**Render PostgreSQL Free Tier:**
- ✅ 1 GB storage
- ✅ 1 database
- ✅ Automatic backups (7 days)
- ✅ No credit card required
- ⚠️  Expires after 90 days (can renew)

**Upgrade ($7/month):**
- ✅ 10 GB storage
- ✅ Never expires
- ✅ 14-day backups
- ✅ Better performance

---

## 🎉 **Success Checklist:**

After migration, verify:

- [ ] Render PostgreSQL database created
- [ ] DATABASE_URL environment variable set
- [ ] Code pushed and deployed
- [ ] Logs show "Database connected!"
- [ ] Can create tasks/habits
- [ ] Data persists after restart
- [ ] App works on Render
- [ ] App still works locally (JSON fallback)

---

## 🔄 **Rollback (If Needed):**

If something goes wrong:

1. Remove DATABASE_URL environment variable
2. Redeploy
3. App will use JSON again (but data on Render will be lost)

---

## 🚀 **Next Steps:**

After successful migration:

1. ✅ Test thoroughly
2. ✅ Add some data
3. ✅ Restart app to verify persistence
4. ✅ Share your app with others!
5. ✅ Consider upgrading Render plan for production use

---

**Your data is now safe and will persist forever!** 🎉

For questions, see the troubleshooting section or check Render logs.

