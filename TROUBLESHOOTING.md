# 故障排查指南

## 📋 如果部署还是失败，按以下步骤排查

### 1️⃣ 检查错误类型

#### A. ModuleNotFoundError: No module named 'xxx'

**原因**: Python 包缺失

**解决方案**:

1. 查看错误信息中缺失的包名，例如：
   ```
   ModuleNotFoundError: No module named 'langchain_community'
   ```

2. 在本地测试是否需要该包：
   ```bash
   # 在本地项目目录
   python3 -c "from langchain_community import xxx"
   ```

3. 如果确实需要，添加到 `requirements.txt`：
   ```bash
   echo "langchain-community>=0.1.0" >> requirements.txt
   git add requirements.txt
   git commit -m "Fix: 添加缺失的 langchain-community 包"
   git push
   ```

4. 在服务器上重新部署：
   ```bash
   cd /www/wwwroot/qiaoagent
   git pull
   ./docker-deploy.sh
   ```

---

#### B. ImportError: cannot import name 'xxx' from 'yyy'

**原因**: 包版本不兼容或导入路径错误

**解决方案**:

1. 检查官方文档的正确导入方式
2. 更新包版本或修改导入路径
3. 示例：
   ```python
   # 错误
   from langchain.callbacks.base import BaseCallbackHandler
   
   # 正确
   from langchain_core.callbacks.base import BaseCallbackHandler
   ```

---

#### C. ECONNRESET 或网络错误

**原因**: npm 下载依赖时网络不稳定

**解决方案**:

1. 等待 5-10 分钟后重试
2. 如果持续失败，检查服务器网络：
   ```bash
   ping registry.npmmirror.com
   curl -I https://registry.npmmirror.com
   ```
3. 如果淘宝镜像不可用，换成华为云镜像：
   ```dockerfile
   # 在 Dockerfile 中修改
   RUN npm config set registry https://mirrors.huaweicloud.com/repository/npm/
   ```

---

#### D. Permission denied 或权限错误

**原因**: 文件或目录权限不足

**解决方案**:

1. 检查 Dockerfile 中的权限设置：
   ```dockerfile
   RUN chown -R nextjs:nodejs /home/nextjs
   RUN chmod -R 755 /usr/local/lib/python3.11
   ```

2. 确保所有复制的文件都有 `--chown=nextjs:nodejs`：
   ```dockerfile
   COPY --from=builder --chown=nextjs:nodejs /app/public ./public
   ```

---

### 2️⃣ 快速诊断命令

在服务器上执行以下命令进行诊断：

```bash
# 1. 检查容器状态
docker ps -a

# 2. 查看容器日志
docker logs qiaoagent

# 3. 进入容器检查
docker exec -it qiaoagent /bin/bash

# 4. 在容器内检查 Python 包
docker exec -it qiaoagent python3 -c "import crewai; print(crewai.__version__)"
docker exec -it qiaoagent python3 -c "from langchain_core.callbacks.base import BaseCallbackHandler; print('OK')"
docker exec -it qiaoagent python3 -c "from langchain_openai import ChatOpenAI; print('OK')"

# 5. 检查文件权限
docker exec -it qiaoagent ls -la /home/nextjs
docker exec -it qiaoagent ls -la /app

# 6. 检查 Python 包安装位置
docker exec -it qiaoagent python3 -c "import sys; print('\n'.join(sys.path))"
```

---

### 3️⃣ 完全重建（最后手段）

如果以上都不行，完全清理并重建：

```bash
cd /www/wwwroot/qiaoagent

# 1. 停止并删除所有容器和镜像
docker-compose down
docker rmi qiaoagent:latest
docker system prune -a -f

# 2. 拉取最新代码
git reset --hard origin/main
git pull

# 3. 重新构建
chmod +x docker-deploy.sh
./docker-deploy.sh
```

---

### 4️⃣ 本地测试（推荐）

在本地先测试 Python 代码是否能运行：

```bash
# 1. 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# 或
.venv\Scripts\activate  # Windows

# 2. 安装依赖
pip install -r requirements.txt

# 3. 测试导入
python3 -c "
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain_core.callbacks.base import BaseCallbackHandler
from dotenv import load_dotenv
print('✅ 所有导入成功！')
"

# 4. 测试运行
cd crew
python3 -c "from main import run_workflow; print('✅ 模块加载成功！')"
```

---

### 5️⃣ 联系我

如果以上都不行，请提供以下信息：

1. **完整的错误日志**:
   ```bash
   docker logs qiaoagent > error.log 2>&1
   ```

2. **容器内的 Python 包列表**:
   ```bash
   docker exec -it qiaoagent pip3 list > packages.txt
   ```

3. **Dockerfile 和 requirements.txt 的内容**

4. **服务器环境信息**:
   ```bash
   docker --version
   docker-compose --version
   python3 --version
   uname -a
   ```

---

## 📊 当前配置总结

### requirements.txt
```txt
crewai>=0.28.8           # AI Agent 框架
fastapi>=0.109.0         # Web 框架
uvicorn>=0.27.0          # ASGI 服务器
langchain-core>=0.1.0    # BaseCallbackHandler
langchain-openai>=0.1.7  # ChatOpenAI
python-dotenv>=1.0.0     # 环境变量
pydantic>=2.5.0,<3.0.0   # 数据验证
```

### Python 导入语句
```python
# crew/main.py
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain_core.callbacks.base import BaseCallbackHandler
from dotenv import load_dotenv

# crew/llm_config.py
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# api/*.py
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
```

### 系统依赖（Dockerfile）
```dockerfile
python3
python3-pip
python3-dev
build-essential
wget
curl
sqlite3           # ChromaDB 需要
libsqlite3-dev    # ChromaDB 需要
```

---

## ✅ 预期的成功标志

部署成功后，你应该看到：

1. **容器正常运行**:
   ```bash
   $ docker ps
   CONTAINER ID   IMAGE     STATUS         PORTS
   xxx            qiaoagent Up 2 minutes   0.0.0.0:3355->3000/tcp
   ```

2. **访问网站正常**:
   - https://agent.qiaomu.ai 能打开
   - 输入主题后能看到 "正在加载工作流配置..."

3. **没有 Python 错误**:
   - 不会出现 `ModuleNotFoundError`
   - 不会出现 `ImportError`
   - 不会出现 `PermissionError`

---

## 🎯 最可能的错误和解决方案

根据之前的经验，最可能出现的错误：

| 错误 | 概率 | 解决方案 |
|------|------|---------|
| `ModuleNotFoundError: langchain_community` | 30% | 添加 `langchain-community>=0.1.0` |
| 网络超时（npm） | 20% | 等待重试或换镜像源 |
| `ImportError: cannot import name` | 15% | 检查导入路径是否正确 |
| 权限错误 | 10% | 检查 Dockerfile 的 chown 设置 |
| 其他未知错误 | 25% | 查看日志具体分析 |

---

**祝你好运！🍀**

