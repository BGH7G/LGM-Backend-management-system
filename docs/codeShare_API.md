# Code Share API 文档

## 概述
代码分享功能的完整 API 接口，支持代码文件上传、预览图管理、下载追踪等功能。

## 数据库表结构

### 1. CodeShare (代码分享主表)
- **id**: 主键
- **fileName**: 文件名
- **authorName**: 作者姓名
- **language**: 代码语言 (R/Python/Shell/Other)
- **omicsType**: 组学类型 (转录组/宏基因组/代谢组/16S/宏转录组/蛋白组/其他)
- **description**: 代码描述
- **filePath**: 文件存储路径
- **fileSize**: 文件大小（字节）
- **downloadCount**: 下载次数
- **status**: 状态 (normal/deleted)
- **createdAt**: 创建时间
- **updatedAt**: 更新时间

### 2. CodePreviewImage (代码效果图表)
- **id**: 主键
- **codeShareId**: 代码ID（外键）
- **imagePath**: 图片存储路径
- **imageFileName**: 图片文件名
- **imageSize**: 图片大小
- **imageType**: 图片类型
- **sortOrder**: 排序序号
- **isCover**: 是否为封面图
- **status**: 状态
- **createdAt**: 创建时间

### 3. CodeContent (代码内容表)
- **id**: 主键
- **codeShareId**: 代码ID（外键，一对一）
- **content**: 代码文本内容（LONGTEXT）
- **createdAt**: 创建时间

### 4. CodeDownloadLog (下载日志表)
- **id**: 主键
- **codeShareId**: 代码ID（外键）
- **userId**: 用户ID
- **userName**: 用户名
- **downloadedAt**: 下载时间

## API 端点

### 1. 获取代码分享列表
```
GET /code
```

**查询参数:**
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 10
- `sortBy` (可选): 排序字段，默认 'createdAt'
- `sortOrder` (可选): 排序方向 (ASC/DESC)，默认 'DESC'
- `language` (可选): 筛选语言
- `omicsType` (可选): 筛选组学类型
- `authorName` (可选): 筛选作者名（模糊搜索）
- `status` (可选): 状态筛选，默认 'normal'

**响应示例:**
```json
{
  "success": true,
  "totalItems": 50,
  "items": [...],
  "totalPages": 5,
  "currentPage": 1
}
```

### 2. 获取单个代码分享详情
```
GET /code/:id
```

**响应包含:**
- 代码基本信息
- 所有预览图（按 sortOrder 排序）
- 代码内容（codeContent）

### 3. 创建代码分享
```
POST /code
```

**权限:** 需要管理员权限

**请求体 (multipart/form-data):**
- `fileName`: 文件名（必需）
- `authorName`: 作者姓名（必需）
- `language`: 代码语言（必需）
- `omicsType`: 组学类型（必需）
- `description`: 代码描述（可选）
- `content`: 代码文本内容（可选）
- `codeFile`: 代码文件（可选，单个文件）
- `images`: 预览图（可选，最多10张）

**响应:**
```json
{
  "success": true,
  "msg": "Code share created successfully!",
  "data": {...}
}
```

### 4. 更新代码分享
```
PUT /code/:id
```

**权限:** 需要管理员权限

**请求体:** 同创建接口，所有字段可选

**注意:** 
- 新上传的预览图会追加到现有图片列表
- 如果之前没有图片，第一张新图会自动设为封面

### 5. 删除代码分享（软删除）
```
DELETE /code/:id
```

**权限:** 需要管理员权限

**响应:** 204 No Content

### 6. 删除预览图
```
DELETE /code/images/:imageId
```

**权限:** 需要管理员权限

**响应:** 204 No Content

### 7. 设置封面图
```
PUT /code/:id/cover/:imageId
```

**权限:** 需要管理员权限

**功能:** 将指定图片设为封面，自动取消其他图片的封面状态

### 8. 记录下载
```
POST /code/:id/download
```

**权限:** 可选登录（optionalToken）

**功能:**
- 记录下载日志
- 自动增加下载次数
- 记录用户信息（如果已登录）

### 9. 获取下载日志
```
GET /code/:id/download-logs
```

**权限:** 需要管理员权限

**查询参数:**
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 10

### 10. 获取语言列表
```
GET /code/languages
```

**响应:**
```json
{
  "success": true,
  "data": ["R", "Python", "Shell", "Other"]
}
```

### 11. 获取组学类型列表
```
GET /code/omics-types
```

**响应:**
```json
{
  "success": true,
  "data": ["转录组", "宏基因组", "代谢组", "16S", "宏转录组", "蛋白组", "其他"]
}
```

## 使用示例

### 创建代码分享（使用 FormData）
```javascript
const formData = new FormData();
formData.append('fileName', 'analysis.R');
formData.append('authorName', '张三');
formData.append('language', 'R');
formData.append('omicsType', '转录组');
formData.append('description', '转录组差异分析代码');
formData.append('content', 'library(DESeq2)...');
formData.append('codeFile', codeFileBlob);
formData.append('images', imageBlob1);
formData.append('images', imageBlob2);

fetch('/code', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

### 查询代码列表（带筛选）
```javascript
fetch('/code?page=1&pageSize=10&language=R&omicsType=转录组&sortBy=downloadCount&sortOrder=DESC')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 记录下载
```javascript
fetch('/code/123/download', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN' // 可选
  }
});
```

## 注意事项

1. **文件上传限制:**
   - 代码文件: 最大 10MB
   - 预览图: 最多 10 张

2. **权限要求:**
   - 查询操作: 无需登录或可选登录
   - 创建/更新/删除: 需要管理员权限
   - 下载记录: 可选登录（会记录用户信息）

3. **软删除:**
   - 删除操作只是将 status 设为 'deleted'
   - 数据仍保留在数据库中

4. **预览图管理:**
   - 第一张上传的图片自动设为封面
   - 可以手动更改封面图
   - 删除图片是软删除

5. **下载追踪:**
   - 每次下载都会记录日志
   - 自动增加下载计数
   - 支持匿名下载（userId 为 null）

## 文件存储路径

- **代码文件:** `public/images/Code`
- **预览图:** `public/images/Code`

确保这些目录存在且有写入权限。
