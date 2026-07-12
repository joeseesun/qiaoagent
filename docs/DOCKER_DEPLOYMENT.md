# Docker 部署指南

本文档详细说明如何在你的服务器上使用 Docker 部署 QiaoAgent。

## 📋 前置要求

- 服务器已安装 Docker（版本 20.10+）
- 服务器已安装 Docker Compose（版本 2.0+）
- 服务器可以访问互联网
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 检查 Docker 安装

```bash
docker --version
docker-compose --version
```

如果未安装，请参考 [Docker 官方文档](https://docs.docker.com/engine/install/)。

## 🚀 快速部署（推荐）

### 方法一：使用 Docker Compose（最简单）

**1. 克隆项目到服务器**

```bash
# SSH 登录到你的服务器
ssh user@your-server-ip

# 克隆项目
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent
```

**2. 配置环境变量**

```bash
# 复制环境变量模板
cp .env.production.example .env.production

# 编辑环境变量（使用 vim 或 nano）
vim .env.production
```

**必需配置：**
```bash
ADMIN_PASSWORD=your-secure-password
OPENAI_API_KEY=sk-your-api-key
```

**3. 启动服务**

```bash
# 使用 docker-compose 启动
docker-compose --env-file .env.production up -d

# 查看日志
docker-compose logs -f
```

**4. 验证本机监听**

```bash
curl -I http://127.0.0.1:3355
```

不要对公网开放 `3355`；请按下方说明配置 Nginx 反向代理和 HTTPS 后再访问。

### 方法二：使用 Docker 命令

**1. 构建镜像**

```bash
docker build -t qiaoagent:latest .
```

**2. 运行容器**

```bash
docker run -d \
  --name qiaoagent \
  --restart unless-stopped \
  -p 127.0.0.1:3355:3355 \
  -e OPENAI_API_KEY=sk-your-api-key \
  -e ADMIN_PASSWORD=your-password \
  -e TUZI_API_KEY=sk-your-tuzi-key \
  -e KIMI_API_KEY=sk-your-kimi-key \
  -e DEEPSEEK_API_KEY=sk-your-deepseek-key \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/workflows:/app/workflows \
  qiaoagent:latest
```

**3. 查看日志**

```bash
docker logs -f qiaoagent
```

## 🔧 常用管理命令

### 查看运行状态

```bash
# 使用 docker-compose
docker-compose ps

# 使用 docker
docker ps | grep qiaoagent
```

### 停止服务

```bash
# 使用 docker-compose
docker-compose down

# 使用 docker
docker stop qiaoagent
```

### 重启服务

```bash
# 使用 docker-compose
docker-compose restart

# 使用 docker
docker restart qiaoagent
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose --env-file .env.production up -d

# 3. 查看日志确认启动成功
docker-compose logs -f
```

### 查看日志

```bash
# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100

# 只查看错误日志
docker-compose logs | grep -i error
```

### 进入容器调试

```bash
# 使用 docker-compose
docker-compose exec qiaoagent sh

# 使用 docker
docker exec -it qiaoagent sh
```

### 清理旧镜像

```bash
# 删除未使用的镜像
docker image prune -a

# 删除所有停止的容器
docker container prune
```

## 🌐 配置反向代理（推荐）

### 使用 Nginx

**1. 安装 Nginx**

```bash
sudo apt update
sudo apt install nginx
```

**2. 创建 Nginx 配置**

```bash
sudo vim /etc/nginx/sites-available/qiaoagent
```

**配置内容：**

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://127.0.0.1:3355;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**3. 启用配置**

```bash
sudo ln -s /etc/nginx/sites-available/qiaoagent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**4. 配置 HTTPS（可选但推荐）**

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

## 🔒 安全建议

1. **使用强密码**
   - `ADMIN_PASSWORD` 应该是强密码（至少 16 位，包含大小写字母、数字、特殊字符）

2. **禁止公网访问应用端口**
   ```bash
   # 端口已绑定 loopback；防火墙再显式拒绝公网直连
   sudo ufw deny 3355/tcp
   ```

3. **定期更新**
   ```bash
   # 定期拉取最新代码并重新部署
   git pull && docker-compose down && docker-compose up -d --build
   ```

4. **备份配置**
   ```bash
   # 定期备份配置文件和工作流
   tar -czf backup-$(date +%Y%m%d).tar.gz config/ workflows/ .env.production
   ```

## 📊 监控和日志

### 查看资源使用情况

```bash
# 查看容器资源使用
docker stats qiaoagent

# 查看磁盘使用
docker system df
```

### 设置日志轮转

编辑 `docker-compose.yml`，添加日志配置：

```yaml
services:
  qiaoagent:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## ❓ 常见问题

### 1. 容器启动失败

```bash
# 查看详细错误日志
docker-compose logs

# 检查端口是否被占用
sudo lsof -i :3355
```

### 2. 内存不足

```bash
# 限制容器内存使用
docker-compose.yml 中添加：
    mem_limit: 2g
    mem_reservation: 1g
```

### 3. 构建速度慢

```bash
# 使用国内镜像加速
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn"
  ]
}

# 重启 Docker
sudo systemctl restart docker
```

### 4. Python 依赖安装失败

```bash
# 重新构建，不使用缓存
docker-compose build --no-cache
```

## 🎯 性能优化

1. **使用多阶段构建**（已在 Dockerfile 中实现）
2. **启用 Gzip 压缩**（在 Nginx 中配置）
3. **配置 CDN**（如果有静态资源）
4. **增加服务器内存**（推荐至少 4GB）

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查 GitHub Issues：https://github.com/joeseesun/qiaoagent/issues
3. 提交新 Issue 并附上错误日志

---

**祝部署顺利！** 🎉
