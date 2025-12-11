# Quick Deploy - Flow App Online in 5 Minutes

**Get your Flow app online in 5 minutes using Render (free)!**

---

## 🚀 Step-by-Step (5 Minutes)

### **Step 1: Update Files (2 minutes)**

#### **Add to `requirements.txt`:**
```bash
cd /Users/alexafal/Documents/Coding_Files/Python/Flow_App
echo "gunicorn==21.2.0" >> requirements.txt
```

#### **Update `app.py` (bottom of file):**
Add this at the very end:
```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

---

### **Step 2: Push to GitHub (1 minute)**

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main

# Create repo on GitHub first, then:
git remote add origin https://github.com/Alexafal/flow-app.git
git push -u origin main
```

---

### **Step 3: Deploy on Render (2 minutes)**

1. **Go to** https://render.com
2. **Sign up** (free, no credit card)
3. **Click** "New +" → "Web Service"
4. **Connect** your GitHub repository
5. **Configure:**
   - Name: `flow-app`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
6. **Click** "Create Web Service"

**Wait 2-3 minutes... Done!** 🎉

Your app is live at: `https://flow-app-xxxx.onrender.com`

---

## ✅ That's It!

Your Flow app is now:
- ✅ Online and accessible anywhere
- ✅ Secured with HTTPS
- ✅ Automatically deployed on git push
- ✅ Free to use

---

## 🔄 Update Your App

Anytime you make changes:
```bash
git add .
git commit -m "Update app"
git push
```

Render automatically redeploys! (takes ~2 minutes)

---

## 🎯 Alternative: Railway (Even Easier!)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Done! (Railway auto-detects everything)

---

## 📱 Share Your App

Your Flow app is now at:
- Render: `https://flow-app-xxxx.onrender.com`
- Railway: `https://your-app.up.railway.app`

Share this link with anyone!

---

## ⚠️ Important Notes

### **Free Tier Limitations:**
- App sleeps after 15 min of inactivity
- First load might be slow (30 seconds)
- Data resets on restart (see below)

### **Fix Data Loss:**

Your JSON file gets reset because it's not persistent. Options:

**Quick Fix:** Use environment variables
**Better Fix:** Add PostgreSQL (free on Render)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details.

---

## 🔧 Troubleshooting

### **App won't start?**
Check Render logs:
- Dashboard → Your Service → Logs
- Look for errors

### **Static files not loading?**
Render auto-detects `static/` folder. Should work automatically.

### **Data keeps resetting?**
Use a database! See full deployment guide.

---

## 🎨 Custom Domain (Optional)

Want `flow.yourdomain.com`?

1. Buy domain (Namecheap, Google Domains)
2. In Render: Settings → Custom Domain
3. Add your domain
4. Update DNS records as shown
5. Wait 5-10 minutes for DNS propagation

Done! Your app at your domain with free SSL.

---

## 📊 Upgrade to Paid (Optional)

**Render Starter:** $7/month
- Always on (no sleep)
- Faster performance
- Persistent disk

**Worth it for production use!**

---

## 🚀 Next Steps

1. ✅ Deploy app (you just did this!)
2. 📱 Test on mobile
3. 🔒 Add database for persistence
4. 🎨 Add custom domain
5. 📊 Set up analytics (optional)

---

## 💡 Pro Tips

1. **Keep it awake:** Use UptimeRobot (free) to ping your app every 5 minutes
2. **Monitor:** Set up Render notifications for deploy status
3. **Logs:** Check logs regularly for errors
4. **Backups:** Export your data regularly
5. **Updates:** Push updates often, Render handles deployments

---

**Your Flow app is now online! Share it with the world!** 🌍✨

For advanced deployment options, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

