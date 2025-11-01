# Docker 快速部署指南

## 🚀 3 步部署到你的服务器

### 步骤 1：准备服务器

SSH 登录到你的服务器：

```bash
ssh user@your-server-ip
```

确保已安装 Docker 和 Docker Compose：

```bash
docker --version
docker-compose --version
```

如果未安装，运行：

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步骤 2：克隆并配置

```bash
# 克隆项目
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent

# 配置环境变量
cp .env.production.example .env.production
nano .env.production  # 或使用 vim
```

**必需配置：**

```bash
ADMIN_PASSWORD=your-secure-password-here
OPENAI_API_KEY=sk-your-api-key-here
```

### 步骤 3：一键部署

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

等待 2-5 分钟，部署完成！

## 🌐 访问应用

- **主页：** `http://your-server-ip:3355`
- **管理后台：** `http://your-server-ip:3355/admin`

## 📊 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新应用
git pull
docker-compose down
docker-compose up -d --build
```

## 🔧 配置 Nginx 反向代理（可选）

如果你想使用域名访问：

```bash
# 安装 Nginx
sudo apt install nginx

# 创建配置
sudo nano /etc/nginx/sites-available/qiaoagent
```

**配置内容：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3355;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**启用配置：**

```bash
sudo ln -s /etc/nginx/sites-available/qiaoagent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**配置 HTTPS：**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ❓ 遇到问题？

1. **查看日志：** `docker-compose logs -f`
2. **检查容器状态：** `docker ps`
3. **重新构建：** `docker-compose build --no-cache`
4. **查看详细文档：** [docs/DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md)

---

**祝部署顺利！** 🎉

