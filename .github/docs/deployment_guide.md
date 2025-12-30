# Deployment Guide: Chesstic v2 to Digital Ocean

## Server Information
- **Server IP**: 159.65.140.136
- **GitHub Repository**: https://github.com/Jayfetra/chesstic_v2/tree/master

---

## Prerequisites & Preparation Checklist

### 1. Local Preparation
- [ ] GitHub repository with latest code pushed
- [ ] `.env` file ready with production values (DO NOT commit this)
- [ ] SSH key pair generated for secure server access
- [ ] Domain name (optional but recommended)

### 2. Environment Variables to Prepare
Create a `.env.production` file locally with these variables:
```bash
# Flask Settings
SECRET_KEY=your-super-secret-key-here-minimum-32-chars
FLASK_ENV=production

# OpenAI API (for AI Chess Advisor feature)
OPENAI_API_KEY=your-openai-api-key-here

# Stockfish Engine Path (will be set on server)
STOCKFISH_PATH=/usr/games/stockfish
ENGINE_ANALYSIS_ENABLED=True
ENGINE_DEPTH=15
ENGINE_TIME_LIMIT=2.0

# Optional: CORS settings if you have a specific domain
# CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Required Accounts/Access
- [ ] Digital Ocean account with access to server 159.65.140.136
- [ ] SSH access to the server (root or sudo user)
- [ ] GitHub account access to repository

---

## Step-by-Step Deployment Process

### Phase 1: Server Setup & Initial Configuration

#### Step 1.1: Connect to Your Server
```bash
ssh root@159.65.140.136
```
Or if using a non-root user:
```bash
ssh your-username@159.65.140.136
```

#### Step 1.2: Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

#### Step 1.3: Install Python 3.12 and Dependencies
```bash
# Install Python 3.12
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# Install system dependencies
sudo apt install -y build-essential libssl-dev libffi-dev python3-pip git nginx
```

#### Step 1.4: Install Stockfish (for game analysis)
```bash
sudo apt install -y stockfish
# Verify installation
which stockfish
# Should output: /usr/games/stockfish
```

#### Step 1.5: Install UV Package Manager
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

#### Step 1.6: Create Application User (Security Best Practice)
```bash
sudo adduser --system --group --home /opt/chesstic chesstic
sudo mkdir -p /opt/chesstic
sudo chown chesstic:chesstic /opt/chesstic
```

---

### Phase 2: Deploy Application Code

#### Step 2.1: Clone Repository
```bash
# Switch to application user
sudo -u chesstic bash
cd /opt/chesstic

# Clone repository
git clone https://github.com/Jayfetra/chesstic_v2.git app
cd app
```

#### Step 2.2: Set Up Python Environment with UV
```bash
# Install dependencies using uv
uv sync

# Verify installation
uv run python --version  # Should show Python 3.12.x
```

#### Step 2.3: Configure Environment Variables
```bash
# Create .env file
nano .env
```

Paste your production environment variables:
```bash
SECRET_KEY=generate-a-strong-secret-key-here
FLASK_ENV=production
OPENAI_API_KEY=your-openai-api-key
STOCKFISH_PATH=/usr/games/stockfish
ENGINE_ANALYSIS_ENABLED=True
ENGINE_DEPTH=15
ENGINE_TIME_LIMIT=2.0
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Secure the .env file
chmod 600 .env
```

---

### Phase 3: Configure Production Server (Gunicorn)

#### Step 3.1: Install Gunicorn
```bash
uv add gunicorn
```

#### Step 3.2: Create Gunicorn Configuration
```bash
nano gunicorn_config.py
```

Add this content:
```python
"""Gunicorn configuration for Chesstic v2"""
import multiprocessing

# Server Socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker Processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2

# Logging
accesslog = "/var/log/chesstic/access.log"
errorlog = "/var/log/chesstic/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process Naming
proc_name = "chesstic"

# Server Mechanics
daemon = False
pidfile = "/var/run/chesstic/gunicorn.pid"
umask = 0
user = None
group = None
tmp_upload_dir = None

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
```

#### Step 3.3: Create Log Directory
```bash
# Exit from chesstic user
exit

# Create log directory as root
sudo mkdir -p /var/log/chesstic
sudo mkdir -p /var/run/chesstic
sudo chown -R chesstic:chesstic /var/log/chesstic
sudo chown -R chesstic:chesstic /var/run/chesstic
```

---

### Phase 4: Configure Systemd Service

#### Step 4.1: Create Systemd Service File
```bash
sudo nano /etc/systemd/system/chesstic.service
```

Add this content:
```ini
[Unit]
Description=Chesstic v2 Flask Application
After=network.target

[Service]
Type=notify
User=chesstic
Group=chesstic
WorkingDirectory=/opt/chesstic/app
Environment="PATH=/opt/chesstic/.local/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/opt/chesstic/app/.env
ExecStart=/opt/chesstic/.local/bin/uv run gunicorn -c gunicorn_config.py run:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Step 4.2: Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable chesstic
sudo systemctl start chesstic
sudo systemctl status chesstic
```

---

### Phase 5: Configure Nginx Reverse Proxy

#### Step 5.1: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/chesstic
```

Add this content:
```nginx
server {
    listen 80;
    server_name 159.65.140.136;  # Replace with your domain if you have one

    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/chesstic_access.log;
    error_log /var/log/nginx/chesstic_error.log;

    # Static files
    location /static {
        alias /opt/chesstic/app/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
    }
}
```

#### Step 5.2: Enable Site and Restart Nginx
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chesstic /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Phase 6: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL setup)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

### Phase 7: Test Deployment

#### Test 7.1: Check Application Status
```bash
# Check Gunicorn service
sudo systemctl status chesstic

# Check Nginx
sudo systemctl status nginx

# Check application logs
sudo tail -f /var/log/chesstic/error.log
```

#### Test 7.2: Access Application
Open your browser and visit:
- http://159.65.140.136

You should see your chess analytics application!

---

## Phase 8: SSL Certificate Setup (HTTPS) - Optional but Recommended

### Step 8.1: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 8.2: Obtain SSL Certificate
**Note**: You need a domain name for this step. If using 159.65.140.136, skip to manual certificate setup.

```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS.

### Step 8.3: Auto-renewal Setup
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

---

## Maintenance & Management Commands

### View Logs
```bash
# Application logs
sudo tail -f /var/log/chesstic/error.log
sudo tail -f /var/log/chesstic/access.log

# Nginx logs
sudo tail -f /var/log/nginx/chesstic_error.log
sudo tail -f /var/log/nginx/chesstic_access.log

# System logs for the service
sudo journalctl -u chesstic -f
```

### Restart Services
```bash
# Restart application
sudo systemctl restart chesstic

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx
```

### Update Application Code
```bash
# Switch to application user
sudo -u chesstic bash
cd /opt/chesstic/app

# Pull latest code
git pull origin master

# Install/update dependencies
uv sync

# Exit from chesstic user
exit

# Restart application
sudo systemctl restart chesstic
```

### Check Service Status
```bash
sudo systemctl status chesstic
sudo systemctl status nginx
```

---

## Troubleshooting Guide

### Issue: Application Won't Start

**Check logs:**
```bash
sudo journalctl -u chesstic -n 50
sudo tail -n 50 /var/log/chesstic/error.log
```

**Common fixes:**
- Check `.env` file exists and has correct permissions
- Verify Python path in systemd service
- Check if port 8000 is already in use: `sudo netstat -tlnp | grep 8000`

### Issue: 502 Bad Gateway

**Causes:**
- Gunicorn not running
- Wrong port in Nginx config
- Firewall blocking connection

**Fix:**
```bash
# Check if Gunicorn is running
sudo systemctl status chesstic

# Check Nginx error logs
sudo tail -f /var/log/nginx/chesstic_error.log

# Restart both services
sudo systemctl restart chesstic
sudo systemctl restart nginx
```

### Issue: Static Files Not Loading

**Fix:**
```bash
# Check file permissions
sudo chmod -R 755 /opt/chesstic/app/static

# Verify path in Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: High Memory Usage

**Fix:**
- Reduce Gunicorn workers in `gunicorn_config.py`
- Add memory limits to systemd service
- Monitor with: `htop` or `free -h`

---

## Security Checklist

- [ ] Strong `SECRET_KEY` set in `.env`
- [ ] `.env` file permissions set to 600
- [ ] Firewall (UFW) enabled with only necessary ports open
- [ ] Application running as non-root user (chesstic)
- [ ] Nginx security headers configured
- [ ] SSL/HTTPS enabled (if using domain)
- [ ] Regular system updates scheduled
- [ ] OpenAI API key secured in `.env`
- [ ] Disable debug mode in production

---

## Performance Optimization Tips

1. **Enable Response Caching**: Already implemented in code with Flask cache
2. **Monitor Resource Usage**: Install monitoring tools
   ```bash
   sudo apt install htop
   ```
3. **Database**: Consider adding Redis for caching if needed
4. **CDN**: Use CDN for static assets if you get high traffic
5. **Monitor Logs**: Set up log rotation
   ```bash
   sudo nano /etc/logrotate.d/chesstic
   ```

---

## Backup Strategy

### Backup Script
Create a backup script:
```bash
sudo nano /opt/chesstic/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/chesstic/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cd /opt/chesstic/app

# Backup .env file
cp .env "$BACKUP_DIR/env_$DATE"

# Backup entire application (excluding .git)
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    /opt/chesstic/app

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +15 | xargs rm -f

echo "Backup completed: $DATE"
```

Make it executable:
```bash
sudo chmod +x /opt/chesstic/backup.sh
```

Schedule daily backups:
```bash
sudo crontab -e
# Add this line:
0 2 * * * /opt/chesstic/backup.sh
```

---

## Quick Reference Commands

```bash
# Application Management
sudo systemctl start chesstic      # Start application
sudo systemctl stop chesstic       # Stop application
sudo systemctl restart chesstic    # Restart application
sudo systemctl status chesstic     # Check status

# View Logs
sudo journalctl -u chesstic -f     # Follow service logs
sudo tail -f /var/log/chesstic/error.log  # Follow error logs

# Update Code
cd /opt/chesstic/app && sudo -u chesstic git pull && sudo systemctl restart chesstic

# Check Server Health
htop                               # Resource usage
sudo systemctl status nginx        # Nginx status
sudo systemctl status chesstic     # App status
```

---

## Support & Additional Resources

- **Flask Deployment**: https://flask.palletsprojects.com/en/latest/deploying/
- **Gunicorn Documentation**: https://docs.gunicorn.org/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Digital Ocean Tutorials**: https://www.digitalocean.com/community/tutorials

---

## Next Steps After Deployment

1. **Set up monitoring**: Consider tools like Prometheus, Grafana, or New Relic
2. **Configure automated backups**: Set up regular backups of configuration and data
3. **Set up CI/CD**: Automate deployments using GitHub Actions
4. **Domain setup**: Point your domain to the server IP
5. **SSL certificate**: Set up HTTPS for secure connections
6. **Performance testing**: Use tools like Apache Bench or k6 to test performance
7. **Error tracking**: Set up Sentry or similar for error monitoring

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Server IP**: 159.65.140.136
**Application URL**: http://159.65.140.136

