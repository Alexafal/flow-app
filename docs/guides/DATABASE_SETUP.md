# Database Setup - Persistent Data Storage

Fix the data loss issue by adding a real database!

---

## 🎯 **Problem:**

Current setup uses `data/flow_data.json` which gets wiped on:
- ❌ App restart
- ❌ New deployment
- ❌ Sleep/wake cycle

---

## ✅ **Solution: PostgreSQL on Render (FREE)**

**Best option because:**
- ✅ Free tier
- ✅ Integrated with Render
- ✅ Easy setup
- ✅ Reliable
- ✅ Automatic backups

---

## 🚀 **Quick Setup (15 minutes)**

### **Step 1: Add PostgreSQL on Render**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `flow-db`
   - **Database:** `flow`
   - **User:** `flow`
   - **Region:** Same as your app
   - **Plan:** **Free** (0 GB)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgres://...`)

---

### **Step 2: Connect App to Database**

In Render dashboard:
1. Go to your **flow-app** service
2. Click **"Environment"** (left sidebar)
3. Click **"Add Environment Variable"**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Internal Database URL
5. Click **"Save Changes"**

---

### **Step 3: Update Your Code**

I'll create the files for you!

---

## 📁 **Files to Add:**

### **1. Update `requirements.txt`**

Add these lines:
```txt
psycopg2-binary==2.9.9
SQLAlchemy==2.0.23
```

### **2. Create `database.py`**

New file for database operations.

### **3. Update `app.py`**

Switch from JSON to database.

---

## 💾 **Migration Plan**

Don't worry! I'll make it backward compatible:
- ✅ Works with PostgreSQL (production)
- ✅ Falls back to JSON (local development)
- ✅ No data loss
- ✅ Easy rollback

---

## 🔧 **Alternative: MongoDB Atlas**

If you prefer MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create free cluster
4. Get connection string
5. Add to Render environment variables

---

## 📊 **Comparison:**

| Option | Setup Time | Free Tier | Best For |
|--------|------------|-----------|----------|
| **PostgreSQL** | 15 min | 1 GB | Recommended |
| **MongoDB Atlas** | 20 min | 512 MB | NoSQL fans |
| **JSON File** | 0 min | - | Local only |

---

## 🎯 **Recommendation:**

Use **PostgreSQL** because:
1. Free on Render
2. Easy integration
3. Reliable
4. Industry standard
5. Better for structured data (tasks, habits)

---

**Let me create the implementation files for you!**

After setup, your data will persist forever! 🎉

