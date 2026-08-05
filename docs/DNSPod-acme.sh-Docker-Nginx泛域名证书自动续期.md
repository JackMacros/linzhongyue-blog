# 从证书过期到自动续期：DNSPod + acme.sh + Docker Nginx 部署泛域名 HTTPS 证书

网站证书过期后，最直接的表现是浏览器提示连接不安全，前端请求也可能因为证书校验失败而无法访问后端接口。本文记录一次真实的修复过程：为 `example.com` 和 `*.example.com` 申请 Let's Encrypt 证书，将证书挂载给 Docker 中的 Nginx，并配置 DNSPod 自动验证和续期。

最终目标如下：

- 同时覆盖根域名与一级子域名；
- 不需要手工添加 `_acme-challenge` TXT 记录；
- 证书文件保存在宿主机，Nginx 容器只负责读取；
- 续期成功后自动检查并重载 Nginx；
- 更新证书时不需要重新构建 Nginx 镜像。

> 本文中的域名、Token 和服务器地址均为示例，实际使用时请替换为自己的配置。

## 一、先确认权威 DNS，而不是只看域名购买平台

域名在哪里买，和 DNS 解析由谁托管，是两件不同的事情。

例如，域名可能在阿里云购买，但 NS 已经切换到了 DNSPod。ACME 客户端必须调用当前**权威 DNS 服务商**的 API，否则会出现一种很迷惑的情况：接口提示 TXT 记录创建成功，但 Let's Encrypt 查询时仍然返回 `NXDOMAIN`。

Linux/macOS 可以执行：

```bash
dig +short NS example.com
```

Windows PowerShell 可以执行：

```powershell
Resolve-DnsName -Type NS example.com
```

DNSPod 常见的权威服务器类似：

```text
*.dnspod.net
```

阿里云 DNS 常见的权威服务器类似：

```text
dns*.hichina.com
```

只有查询结果已经指向 DNSPod，后面才能使用 `dns_dp` 插件。

## 二、创建 DNSPod API Token

进入 DNSPod 控制台，在账号中心创建一个单独用于证书续期的 API Token。创建完成后会得到：

```text
ID
Token
```

建议为证书续期单独创建 Token，不要复用其他业务凭据，也不要把 Token 写进 Git 仓库、Docker Compose 或公开文章。

## 三、安装 acme.sh

证书文件需要写入 Nginx 的宿主机挂载目录，并且续期后需要执行 `docker exec`，因此本文使用 root 安装：

```bash
sudo -i
curl -fsSL https://get.acme.sh | sh
```

指定 Let's Encrypt 为默认 CA：

```bash
/root/.acme.sh/acme.sh --set-default-ca --server letsencrypt
```

检查安装结果：

```bash
/root/.acme.sh/acme.sh --version
crontab -l | grep acme.sh
```

安装器会添加定时任务。这个任务可以频繁执行，因为 acme.sh 会根据证书状态判断是否真的需要续期。

### GitHub 下载超时怎么办

部分云服务器访问 GitHub 源文件节点可能超时。可以在网络正常的电脑下载 acme.sh 源码包，再上传到服务器离线安装：

```bash
tar -xzf acme.sh-master.tar.gz
cd acme.sh-master
sudo ./acme.sh --install --home /root/.acme.sh --accountemail you@example.com
```

离线安装只解决程序下载问题，服务器仍然需要能够访问 Let's Encrypt 和 DNSPod API。

## 四、申请根域名和泛域名证书

先安全地输入 DNSPod 凭据，避免 Token 出现在 Shell 历史中：

```bash
read -r -p "DNSPod Token ID: " DP_Id
read -rs -p "DNSPod Token Key: " DP_Key
echo
export DP_Id DP_Key
```

申请证书：

```bash
/root/.acme.sh/acme.sh --issue \
  --dns dns_dp \
  -d example.com \
  -d '*.example.com' \
  --keylength ec-256
```

这里必须同时写根域名和泛域名：

- `*.example.com` 可以覆盖 `admin.example.com`；
- `*.example.com` 不能覆盖 `example.com`；
- `*.example.com` 也不能覆盖 `api.admin.example.com` 这样的多级子域名。

acme.sh 会自动完成以下流程：

1. 调用 DNSPod API 创建 `_acme-challenge` TXT 记录；
2. 等待 DNS 生效；
3. 请求 Let's Encrypt 验证；
4. 签发证书；
5. 删除临时 TXT 记录；
6. 保存 DNSPod 凭据供后续续期使用。

DNSPod 凭据默认保存在：

```text
/root/.acme.sh/account.conf
```

限制文件权限：

```bash
chmod 600 /root/.acme.sh/account.conf
```

### 公共 DNS 检查节点访问缓慢

如果服务器无法访问 acme.sh 使用的公共 DNS 检查节点，可以跳过在线轮询，改成固定等待：

```bash
/root/.acme.sh/acme.sh --issue \
  --dns dns_dp \
  --dnssleep 210 \
  -d example.com \
  -d '*.example.com' \
  --keylength ec-256
```

`210` 秒不是固定标准，应根据权威 DNS 的 TTL 和公共解析器的负缓存时间调整。不要为了追求速度把等待时间设得过短，否则 Let's Encrypt 可能看到之前缓存的 `NXDOMAIN`。

## 五、将证书安装到宿主机挂载目录

假设 Nginx 证书目录为：

```text
/home/ubuntu/nginx/html
```

先备份旧证书：

```bash
stamp=$(date +%Y%m%d-%H%M%S)

cp -a /home/ubuntu/nginx/html/fullchain.pem \
  "/home/ubuntu/nginx/html/fullchain.pem.expired-$stamp"

cp -a /home/ubuntu/nginx/html/privkey.pem \
  "/home/ubuntu/nginx/html/privkey.pem.expired-$stamp"
```

不要让 Nginx 直接引用 `/root/.acme.sh` 中的内部文件。应通过 `--install-cert` 把证书复制到稳定路径，并记录续期后的重载命令：

```bash
/root/.acme.sh/acme.sh --install-cert \
  -d example.com \
  --ecc \
  --key-file /home/ubuntu/nginx/html/privkey.pem \
  --fullchain-file /home/ubuntu/nginx/html/fullchain.pem \
  --reloadcmd "docker exec nginx nginx -t && docker exec nginx nginx -s reload"
```

这里的 `nginx` 是容器名称。`reloadcmd` 先检查配置，只有检查通过才会重载。

## 六、Docker Compose 和 Nginx 配置

Docker Compose 可以把宿主机证书目录只读挂载进容器：

```yaml
services:
  nginx:
    image: nginx:1.21.1
    container_name: nginx
    restart: unless-stopped
    volumes:
      - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./html:/usr/share/nginx/html:ro
      - ./log:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
```

Nginx 中引用容器内路径：

```nginx
server {
    listen 443 ssl;
    server_name example.com *.example.com;

    ssl_certificate     /usr/share/nginx/html/fullchain.pem;
    ssl_certificate_key /usr/share/nginx/html/privkey.pem;

    # 其他站点配置……
}
```

宿主机文件被 acme.sh 更新后，容器能够立即看到新内容，不需要重新构建镜像。Nginx 重载后，新连接就会使用新证书。

## 七、验证证书和 HTTPS

检查证书的签发者、有效期和 SAN：

```bash
openssl x509 \
  -in /home/ubuntu/nginx/html/fullchain.pem \
  -noout \
  -subject \
  -issuer \
  -dates \
  -ext subjectAltName
```

检查 Nginx：

```bash
docker exec nginx nginx -t
docker exec nginx nginx -s reload
```

从公网验证：

```bash
curl -I https://example.com
```

如果需要绕过 DNS，直接验证源站 IP 和 SNI：

```bash
curl --resolve example.com:443:SERVER_IP \
  -I https://example.com
```

查看 acme.sh 的证书配置和下次续期时间：

```bash
/root/.acme.sh/acme.sh --info -d example.com --ecc
```

## 八、停用旧的 Certbot 手工续期配置

如果服务器之前使用 Certbot 的 `manual + dns-01` 模式，这类证书通常无法无人值守续期。新证书验证成功后，可以先禁用旧续期配置，不要立即删除旧证书归档：

```bash
sudo mv /etc/letsencrypt/renewal/example.com.conf \
  /etc/letsencrypt/renewal/example.com.conf.disabled
```

这样可以避免未来误启动 Certbot 后，与 acme.sh 同时管理同一张证书。

## 九、常见问题复盘

### 1. DNS API 显示创建成功，Let's Encrypt 却返回 NXDOMAIN

优先检查当前公网 NS。最常见的原因是：Token 对应的 DNS 平台中存在同名旧区域，但该平台已经不是权威 DNS。此时 API 操作确实成功了，只是全网根本不会查询那个区域。

### 2. 刚切换 NS 后立即申请失败

递归 DNS 仍可能缓存旧 NS 或旧的 NXDOMAIN。应等待委派和负缓存过期，并分别通过多个公共解析器确认。

### 3. TXT 已经创建，验证仍然失败

直接查询权威 DNS：

```bash
dig TXT _acme-challenge.example.com @YOUR_AUTHORITATIVE_NS
```

如果权威 DNS 能看到、公共解析器看不到，通常是缓存问题；如果权威 DNS 也看不到，则需要检查 Token 权限、域名账号和记录状态。

### 4. 证书更新了，浏览器仍显示旧证书

检查以下事项：

- Nginx 是否读取了正确的挂载路径；
- `nginx -t` 是否通过；
- Nginx 是否执行了 reload；
- 前面是否还有 CDN、负载均衡或其他 TLS 终止层；
- 浏览器连接是否复用了旧会话。

### 5. 删除 DNSPod Token 后自动续期失败

Token 是后续自动续期的必要凭据。如果要轮换 Token，应先创建新 Token，更新 `/root/.acme.sh/account.conf` 或重新执行一次签发配置，再删除旧 Token。

## 十、最终检查清单

- [x] 公网 NS 已指向 DNSPod；
- [x] 根域名和泛域名同时写入证书 SAN；
- [x] DNSPod Token 仅 root 可读；
- [x] 证书保存在宿主机稳定路径；
- [x] Nginx 通过只读目录挂载证书；
- [x] 续期后先执行 `nginx -t` 再 reload；
- [x] acme.sh 定时任务已存在；
- [x] 旧证书已备份；
- [x] 旧 Certbot 手工续期配置已禁用；
- [x] 公网 HTTPS 与源站 SNI 均验证通过。

完成这些配置后，日常更新应用只需要替换业务文件或镜像，HTTPS 证书由宿主机上的 acme.sh 独立管理，不再和应用发布流程耦合。
