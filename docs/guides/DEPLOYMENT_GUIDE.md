# Flow App - Deployment Guide

Complete guide to deploying your Flow app online.

---

## 🚀 Deployment Options

### **Quick Comparison**

| Platform | Difficulty | Cost | Best For |
|----------|------------|------|----------|
| **Heroku** | ⭐ Easy | Free tier | Beginners, quick setup |
| **Render** | ⭐ Easy | Free tier | Modern alternative to Heroku |
| **Vercel** | ⭐⭐ Medium | Free tier | Static + API routes |
| **Railway** | ⭐ Easy | Free trial | Modern deployment |
| **PythonAnywhere** | ⭐ Easy | Free tier | Python-focused |
| **DigitalOcean** | ⭐⭐⭐ Hard | $5/month | Full control |
| **AWS/GCP** | ⭐⭐⭐⭐ Expert | Variable | Enterprise |

---

## 🎯 Recommended: Render (Easiest & Free)

**Why Render?**
- ✅ Free tier (no credit card required)
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL (HTTPS)
- ✅ Easy setup (5 minutes)

### **Step-by-Step Deployment:**

#### **1. Prepare Your App**

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: flow-app
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

Update `requirements.txt`:
```txt
Flask==3.0.0
Flask-CORS==4.0.0
Werkzeug==3.0.1
gunicorn==21.2.0
```

Update `app.py` (bottom of file):
```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

#### **2. Push to GitHub**

```bash
cd /path/to/Flow_App
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flow-app.git
git push -u origin main
```

#### **3. Deploy on Render**

1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** flow-app
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Your app will be live at: `https://flow-app-xxx.onrender.com`

#### **4. Custom Domain (Optional)**

In Render dashboard:
1. Go to your service → Settings
2. Click "Custom Domain"
3. Add your domain (e.g., `flow.yourdomain.com`)
4. Update DNS records as shown

---

## 🎨 Option 2: Vercel (For Static + API)

**Best for:** Fast, modern deployments

### **Setup:**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Create `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    },
    {
      "src": "static/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/app.py"
    }
  ]
}
```

#### **3. Deploy**
```bash
cd Flow_App
vercel
```

Follow prompts → Your app will be live at `https://your-app.vercel.app`

---

## 🐍 Option 3: PythonAnywhere

**Best for:** Python-specific hosting, no credit card needed

### **Setup:**

1. Sign up at https://www.pythonanywhere.com (free tier)
2. Open a Bash console
3. Clone/upload your code:
```bash
git clone https://github.com/YOUR_USERNAME/flow-app.git
cd flow-app
pip install -r requirements.txt --user
```

4. Configure Web App:
   - Go to "Web" tab
   - Add new web app
   - Choose Flask
   - Python version: 3.10
   - Set WSGI file to point to `app.py`

5. Reload web app → Live at `https://YOUR_USERNAME.pythonanywhere.com`

---

## 🚂 Option 4: Railway

**Best for:** Modern, developer-friendly

### **Setup:**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your Flow app repository
5. Railway auto-detects Flask and deploys
6. Live at: `https://your-app.up.railway.app`

**Configuration:**
- Add `Procfile`:
```
web: gunicorn app:app
```

---

## ☁️ Option 5: Heroku

**Note:** Heroku removed free tier, but still popular

### **Setup:**

#### **1. Install Heroku CLI**
```bash
brew install heroku/brew/heroku  # Mac
# or download from https://devcenter.heroku.com/articles/heroku-cli
```

#### **2. Create Required Files**

`Procfile`:
```
web: gunicorn app:app
```

`runtime.txt`:
```
python-3.11.0
```

#### **3. Deploy**
```bash
cd Flow_App
heroku login
heroku create flow-app-unique-name
git push heroku main
heroku open
```

Your app: `https://flow-app-unique-name.herokuapp.com`

---

## 💧 Option 6: DigitalOcean (Full Control)

**Best for:** Production apps, full control

### **Setup:**

#### **1. Create Droplet**
- Go to https://digitalocean.com
- Create Droplet (Ubuntu 22.04, $5/month)
- SSH into droplet

#### **2. Install Dependencies**
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx -y
```

#### **3. Deploy App**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/flow-app.git
cd flow-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

#### **4. Configure Gunicorn**
Create `/etc/systemd/system/flow-app.service`:
```ini
[Unit]
Description=Flow App
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/flow-app
Environment="PATH=/var/www/flow-app/venv/bin"
ExecStart=/var/www/flow-app/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
```

#### **5. Configure Nginx**
Create `/etc/nginx/sites-available/flow-app`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /var/www/flow-app/static;
    }
}
```

#### **6. Enable & Start**
```bash
sudo ln -s /etc/nginx/sites-available/flow-app /etc/nginx/sites-enabled
sudo systemctl start flow-app
sudo systemctl enable flow-app
sudo systemctl restart nginx
```

#### **7. Add SSL (Free)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔒 Important: Data Persistence

**Problem:** Current setup uses `data/flow_data.json` which gets reset on free hosting.

### **Solutions:**

#### **Option 1: Use PostgreSQL (Recommended for production)**

Update `requirements.txt`:
```txt
Flask==3.0.0
Flask-CORS==4.0.0
psycopg2-binary==2.9.9
SQLAlchemy==2.0.23
```

Update `app.py` to use database instead of JSON.

#### **Option 2: Use MongoDB Atlas (Free tier)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Update app to use MongoDB

#### **Option 3: Use Render PostgreSQL**
- In Render dashboard, add PostgreSQL
- Update connection string in app

---

## ⚙️ Pre-Deployment Checklist

Before deploying:

- [ ] Update `requirements.txt` with all dependencies
- [ ] Add `gunicorn` to requirements
- [ ] Set `DEBUG = False` in production
- [ ] Configure environment variables
- [ ] Test locally with production settings
- [ ] Set up database (if needed)
- [ ] Configure CORS properly
- [ ] Add error logging
- [ ] Set up backups for data
- [ ] Test all features

---

## 🔧 Environment Variables

Create `.env` file (don't commit!):
```bash
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=your-database-url
```

Update `app.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-dev-key')
```

Add to `requirements.txt`:
```txt
python-dotenv==1.0.0
```

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Render** | 750 hrs/month | $7/month |
| **Railway** | $5 credit/month | $5/month |
| **Vercel** | 100GB bandwidth | $20/month |
| **PythonAnywhere** | Limited | $5/month |
| **Heroku** | None | $7/month |
| **DigitalOcean** | None | $5/month |

---

## 🎯 My Recommendation

### **For Learning/Testing:**
→ **Render** or **Railway**
- Free tier
- Easy setup
- Good for demos

### **For Production:**
→ **DigitalOcean** or **Render Paid**
- Reliable
- Scalable
- Full control

### **Quickest Deploy:**
→ **Render** (5 minutes)
1. Push to GitHub
2. Connect Render
3. Done!

---

## 🐛 Common Issues

### **Issue: App crashes on startup**
**Solution:** Check logs, ensure all dependencies in `requirements.txt`

### **Issue: Data keeps resetting**
**Solution:** Use database instead of JSON file

### **Issue: Static files not loading**
**Solution:** Configure static file serving in your platform

### **Issue: CORS errors**
**Solution:** Update `Flask-CORS` configuration:
```python
from flask_cors import CORS
CORS(app, origins=['https://your-domain.com'])
```

---

## 📚 Additional Resources

- [Flask Deployment Options](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Render Documentation](https://render.com/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Railway Docs](https://docs.railway.app/)

---

## 🚀 Quick Start: Deploy in 5 Minutes

**Fastest way to get online:**

```bash
# 1. Add gunicorn
echo "gunicorn==21.2.0" >> requirements.txt

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 3. Go to https://render.com
# 4. Sign up & connect GitHub
# 5. Deploy!
```

Your app will be live in 2-3 minutes! 🎉

---

**Need help?** Check platform-specific documentation or the troubleshooting section above.

*Last updated: December 5, 2025*

