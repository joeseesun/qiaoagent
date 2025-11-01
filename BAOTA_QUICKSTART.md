# 宝塔面板 5 分钟快速部署

## 🎯 超简单！只需 6 步

### 步骤 1️⃣：安装 Docker 管理器

1. 登录宝塔面板
2. **软件商店** → 搜索 **"Docker 管理器"** → **安装**

### 步骤 2️⃣：克隆项目

点击宝塔 **终端**，执行：

```bash
cd /www/wwwroot
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent
```

### 步骤 3️⃣：配置环境变量

点击宝塔 **文件** → 进入 `/www/wwwroot/qiaoagent/`

1. 复制 `.env.production.example` → 重命名为 `.env.production`
2. 编辑 `.env.production`，填入：

```bash
ADMIN_PASSWORD=你的管理员密码
OPENAI_API_KEY=sk-你的API密钥
```

### 步骤 4️⃣：一键部署

回到宝塔 **终端**，执行：

```bash
cd /www/wwwroot/qiaoagent
chmod +x docker-deploy.sh
./docker-deploy.sh
```

等待 2-5 分钟，自动完成！

### 步骤 5️⃣：开放端口

宝塔 **安全** → **添加端口规则** → 输入 `3000` → **确定**

### 步骤 6️⃣：访问应用

浏览器打开：`http://你的服务器IP:3000`

**完成！** 🎉

---

## 🌐 进阶：配置域名访问

### 添加网站

宝塔 **网站** → **添加站点**：
- 域名：`your-domain.com`
- PHP：纯静态

### 配置反向代理

网站 **设置** → **反向代理** → **添加**：
- 代理名称：`QiaoAgent`
- 目标 URL：`http://127.0.0.1:3000`

### 配置 SSL

网站 **设置** → **SSL** → **Let's Encrypt** → **申请**

现在访问：`https://your-domain.com` ✅

---

## 📊 常用管理

### 查看状态

宝塔 **Docker** → **容器** → 找到 `qiaoagent`

### 查看日志

容器列表 → 点击 **日志** 按钮

### 重启服务

容器列表 → 点击 **重启** 按钮

或使用终端：

```bash
cd /www/wwwroot/qiaoagent
docker-compose restart
```

### 更新应用

```bash
cd /www/wwwroot/qiaoagent
git pull
docker-compose down
docker-compose up -d --build
```

---

## ❓ 遇到问题？

### 容器启动失败

```bash
cd /www/wwwroot/qiaoagent
docker-compose logs
```

### 端口被占用

修改 `docker-compose.yml`：

```yaml
ports:
  - "3001:3000"  # 改为其他端口
```

### 无法访问

1. 检查宝塔安全规则（端口 3000）
2. 检查云服务器安全组（阿里云/腾讯云）
3. 检查容器状态：`docker ps`

---

## 📖 详细文档

- [宝塔完整部署指南](./docs/BAOTA_DEPLOYMENT.md)
- [Docker 部署文档](./docs/DOCKER_DEPLOYMENT.md)
- [环境变量参考](./docs/ENV_VARS_REFERENCE.md)

---

**就是这么简单！** 🚀

