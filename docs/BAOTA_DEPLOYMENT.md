# 宝塔面板 Docker 部署指南

本文档详细说明如何在宝塔面板上部署 QiaoAgent。

## 📋 前置要求

- 已安装宝塔面板（Linux 版）
- 服务器至少 2GB 内存
- 至少 5GB 可用磁盘空间

## 🚀 方法一：使用宝塔 Docker 管理器（最简单）

### 步骤 1：安装 Docker 管理器

1. 登录宝塔面板
2. 点击左侧菜单 **「软件商店」**
3. 搜索 **「Docker 管理器」**
4. 点击 **「安装」**

![安装 Docker 管理器](https://user-images.githubusercontent.com/placeholder/baota-docker-install.png)

### 步骤 2：安装 Docker Compose

安装完 Docker 管理器后，Docker Compose 会自动安装。

验证安装：
1. 点击左侧菜单 **「Docker」**
2. 点击 **「终端」** 标签
3. 输入命令验证：
   ```bash
   docker --version
   docker-compose --version
   ```

### 步骤 3：创建项目目录

1. 点击左侧菜单 **「文件」**
2. 进入 `/www/wwwroot/` 目录
3. 点击 **「新建目录」**，输入 `qiaoagent`
4. 进入 `qiaoagent` 目录

### 步骤 4：上传项目文件

**方法 A：使用 Git（推荐）**

1. 点击宝塔面板左侧 **「终端」**
2. 执行以下命令：

```bash
cd /www/wwwroot
git clone https://github.com/joeseesun/qiaoagent.git
cd qiaoagent
```

**方法 B：手动上传**

1. 在本地下载项目：https://github.com/joeseesun/qiaoagent/archive/refs/heads/main.zip
2. 解压后，通过宝塔文件管理器上传到 `/www/wwwroot/qiaoagent/`

### 步骤 5：配置环境变量

1. 在宝塔文件管理器中，进入 `/www/wwwroot/qiaoagent/` 目录
2. 找到 `.env.production.example` 文件
3. 点击文件右侧的 **「复制」**，重命名为 `.env.production`
4. 点击 `.env.production` 文件，选择 **「编辑」**
5. 修改以下配置：

```bash
# 必需配置
ADMIN_PASSWORD=your-secure-password-here
OPENAI_API_KEY=sk-your-openai-api-key-here

# 可选配置（如果有其他 LLM）
TUZI_API_KEY=sk-your-tuzi-key
KIMI_API_KEY=sk-your-kimi-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
```

6. 点击 **「保存」**

### 步骤 6：一键部署

**方法 A：使用部署脚本（推荐）**

1. 点击宝塔面板左侧 **「终端」**
2. 执行以下命令：

```bash
cd /www/wwwroot/qiaoagent
chmod +x docker-deploy.sh
./docker-deploy.sh
```

脚本会自动完成所有部署步骤！

**方法 B：手动部署**

1. 点击宝塔面板左侧 **「终端」**
2. 执行以下命令：

```bash
cd /www/wwwroot/qiaoagent
docker-compose --env-file .env.production up -d --build
```

### 步骤 7：开放端口

1. 点击宝塔面板左侧 **「安全」**
2. 点击 **「添加端口规则」**
3. 输入端口：`3355`
4. 备注：`QiaoAgent`
5. 点击 **「确定」**

### 步骤 8：访问应用

打开浏览器访问：
- **主页：** `http://你的服务器IP:3355`
- **管理后台：** `http://你的服务器IP:3355/admin`

## 🌐 方法二：配置域名访问（推荐）

### 步骤 1：添加网站

1. 点击宝塔面板左侧 **「网站」**
2. 点击 **「添加站点」**
3. 填写信息：
   - **域名：** `your-domain.com`（你的域名）
   - **根目录：** `/www/wwwroot/qiaoagent`（随便填，不会用到）
   - **PHP 版本：** 纯静态
4. 点击 **「提交」**

### 步骤 2：配置反向代理

1. 在网站列表中，找到刚创建的网站
2. 点击 **「设置」**
3. 点击左侧 **「反向代理」**
4. 点击 **「添加反向代理」**
5. 填写信息：
   - **代理名称：** `QiaoAgent`
   - **目标 URL：** `http://127.0.0.1:3355`
   - **发送域名：** `$host`
6. 点击 **「提交」**

### 步骤 3：配置 SSL（可选但推荐）

1. 在网站设置中，点击左侧 **「SSL」**
2. 选择 **「Let's Encrypt」**
3. 勾选你的域名
4. 点击 **「申请」**
5. 等待证书申请成功
6. 开启 **「强制 HTTPS」**

现在可以通过 `https://your-domain.com` 访问了！

## 📊 管理和维护

### 查看容器状态

**方法 A：使用宝塔 Docker 管理器**

1. 点击左侧菜单 **「Docker」**
2. 点击 **「容器」** 标签
3. 找到 `qiaoagent` 容器
4. 可以看到运行状态、CPU、内存使用情况

**方法 B：使用终端**

```bash
cd /www/wwwroot/qiaoagent
docker-compose ps
```

### 查看日志

**方法 A：使用宝塔 Docker 管理器**

1. 在容器列表中找到 `qiaoagent`
2. 点击 **「日志」** 按钮
3. 可以实时查看日志

**方法 B：使用终端**

```bash
cd /www/wwwroot/qiaoagent
docker-compose logs -f
```

### 重启服务

**方法 A：使用宝塔 Docker 管理器**

1. 在容器列表中找到 `qiaoagent`
2. 点击 **「重启」** 按钮

**方法 B：使用终端**

```bash
cd /www/wwwroot/qiaoagent
docker-compose restart
```

### 停止服务

```bash
cd /www/wwwroot/qiaoagent
docker-compose down
```

### 更新应用

```bash
cd /www/wwwroot/qiaoagent
git pull origin main
docker-compose down
docker-compose --env-file .env.production up -d --build
```

### 备份配置

1. 点击宝塔面板左侧 **「文件」**
2. 进入 `/www/wwwroot/qiaoagent/` 目录
3. 选中以下文件/文件夹：
   - `.env.production`
   - `config/`
   - `workflows/`
4. 点击 **「压缩」**
5. 下载压缩包到本地保存

## 🔧 常见问题

### 1. Docker 管理器安装失败

**解决方法：**

手动安装 Docker：

```bash
# 使用宝塔终端执行
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. 端口 3355 被占用

**解决方法：**

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3356:3355"  # 改为 3356 或其他未使用的端口
```

然后访问 `http://你的IP:3356`

### 3. 容器启动失败

**解决方法：**

1. 查看日志：`docker-compose logs`
2. 检查环境变量是否正确配置
3. 检查服务器内存是否充足（至少 2GB）
4. 重新构建：`docker-compose build --no-cache`

### 4. 内存不足

**解决方法：**

在 `docker-compose.yml` 中添加内存限制：

```yaml
services:
  qiaoagent:
    mem_limit: 2g
    mem_reservation: 1g
```

### 5. 无法访问（防火墙问题）

**解决方法：**

1. 检查宝塔安全规则是否开放 3355 端口
2. 检查服务器商（阿里云/腾讯云等）的安全组规则
3. 检查容器是否正常运行：`docker ps`

## 🎯 性能优化建议

### 1. 使用宝塔计划任务自动重启

1. 点击左侧菜单 **「计划任务」**
2. 点击 **「添加计划任务」**
3. 填写信息：
   - **任务类型：** Shell 脚本
   - **任务名称：** 重启 QiaoAgent
   - **执行周期：** 每天凌晨 3 点
   - **脚本内容：**
     ```bash
     cd /www/wwwroot/qiaoagent
     docker-compose restart
     ```

### 2. 配置日志轮转

编辑 `docker-compose.yml`，添加：

```yaml
services:
  qiaoagent:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. 监控资源使用

使用宝塔的监控功能：
1. 点击左侧菜单 **「监控」**
2. 查看 CPU、内存、磁盘使用情况
3. 设置告警阈值

## 📞 获取帮助

如果遇到问题：

1. 查看日志：宝塔 Docker 管理器 → 容器 → 日志
2. 查看详细文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
3. 提交 Issue：https://github.com/joeseesun/qiaoagent/issues

## 🎉 总结

使用宝塔面板部署 QiaoAgent 非常简单：

1. ✅ 安装 Docker 管理器
2. ✅ 克隆项目到 `/www/wwwroot/qiaoagent`
3. ✅ 配置 `.env.production`
4. ✅ 运行 `./docker-deploy.sh`
5. ✅ 开放 3355 端口
6. ✅ 配置域名和 SSL（可选）

**整个过程不超过 10 分钟！** 🚀

---

**祝部署顺利！** 如有问题，欢迎提 Issue。

