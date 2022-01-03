# DocB
极简的**Markdown**文档展示页

![preview](https://cdn.jsdelivr.net/gh/SomeBottle/DocB@main/assets/preview.png)   

## 简单介绍
* **SPA**
* 自动替换文档中的```URL```
* 根据锚点生成简单目录  
* 记忆每页浏览的位置  
* 在必要的时候自动展开```<details>```标签  

## 部署方法
1. 将仓库内的文件上传到**静态网站服务器**。  
2. 将**Markdown文档**整理后放在根目录下的一个目录中。
3. 自行修改或者借助[```auto.py```](#%E5%B0%8F%E5%B7%A5%E5%85%B7)生成```config.json```。  

例如我将文档放在根目录下的```test```目录里，一切处理完后整个文件结构如下：  

```
网站根目录
│  404.md
│  auto.py
│  config.json
│  index.html
│  
├─assets
│      main.css
│      main.js
│      preview.png
│      rou.m.js
│      top.png
│      
└─test  <--文档都在这个目录里
    │  bookmarks.md
    │  README.md
    │  
    ├─Algo
    │      BinarySearch.md
    │      
    └─Others
        │  DatabaseRelationalAlgebra.md
        │  
        ├─Physics
        │      HallEfxAndSemiconductor.md
        │      PhyExpMeasuredAndSignificantFigure.md
        │      
        └─Python
                TipsOfRegex.md
```

## 配置文件  
根目录下的```config.json```：  

```json
{
  "doc_title": "Document",
  "auto_url": true,
  "jump_hist": true,
  "index": [],
  "pages": {},
  "not_found": [
    "404.md",
    "404"
  ]
}
```

* ```doc_title``` - 主标题  
* ```auto_url``` - 是否自动替换页面中的```URL```  

    页面中被替换的```URL```主要分两种：  

    1. 不以```http```或```https```开头的```URL```会被替换成```#URL```。  

    2. 以```#```开头的锚点链接将会被替换成触发函数，用于**跳转到锚点**。  

* ```jump_hist``` - 是否回到上次页面浏览的地方  
* ```index``` - 主页配置  
* ```pages``` - 其他页面配置  
* ```not_found``` - 404页面配置  

其中```index```和```not_found```配置类似：
* 数组第0位代表```文档的路径```  
* 数组第1位代表```文档的标题```  

比如配置```index```如下：  
```json
"index": [
    "test/README.md",
    "主页"
]
```
当用户访问主页时就会**抓取**本目录下```./test/```目录的```README.md```，标题显示```主页```。  

```pages```的配置多了个**目录层级**的概念：
```json
"pages": {
    "bookmarks.md": [
      "test/bookmarks.md",
      "书签"
    ],
    "Python": {
      "DontForgetDotInFormat.md": [
        "test/Python/DontForgetDotInFormat.md",
        "Python里字符串Format时的一个易错“点”"
      ],
      "NoteOfPythonOOP.md": [
        "test/Python/NoteOfPythonOOP.md",
        "Python面向对象小备忘"
      ],
      "folder2": {
        "TipsOfRegex.md": [
          "test/Python/folder2/TipsOfRegex.md",
          "Python正则表达式细节小记"
        ]
      }
    }
}
```

这个配置例子中，```Python```和```bookmarks.md```是同一层，也就是他们位于同一目录下，具体还要结合```hash```来说明一下：  

|hash|访问到的对象|文件路径|
|:---:|:---:|:---:|
|```#bookmarks.md```|```pages["bookmarks.md"]```|```test/bookmarks.md```|
|```#Python/DontForgetDotInFormat.md```|```pages["Python"]["DontForgetDotInFormat.md"]```|```test/Python/DontForgetDotInFormat.md```|
|```#Python/folder2/TipsOfRegex.md```|```pages["Python"]["folder2"]["TipsOfRegex.md"]```|```test/Python/folder2/TipsOfRegex.md```|

文件路径是相对于**本应用根目录**的（也就是```index.html```所在目录）  

## 小工具  
为了**方便生成配置文件**，我写了一个小脚本```auto.py```，和```index.html```放在同一目录下。  

运行方式：

```
python auto.py
```

**第一步**会要求输入**要扫描的相对目录**（相对当前工作目录），按上面的例子，这里就输入```test```：  

```
当前工作目录：D:\test_environment\
请输入你要生成文档的目录(首尾不要斜杠)：test
```
(如果该相对目录不存在，会重新让你再输入一次)  

**第二步**要求输入**用作主页**的文档（相对于**第一步**的目录），比如我要用```test/README.md```文档，这里就输入```README.md```：  

```
请输入你要用作主页index的文档文件(基于上述目录)：README.md
```

(如果该文件不存在，会重新让你再输入一次)  

接着该脚本就会在**相同目录下**生成一个```config.json```文件。

（脚本会**自动提取**文档中**第一个markdown标题**作为文档标题内容，如果没找到会留空）

## 示例

在线Demo：https://doge.imbottle.com/DocB  

这里放一段**用于主页**的md文档示例，展示**如何写相对路径链接**：

```markdown
## Content  
0. [书签签](bookmarks.md)  
1. [大学物理实验有效数字与测量值小记](Others/Physics/PhyExpMeasuredAndSignificantFigure.md)  
2. [【动画解释】关系数据库de关系代数小记](Others/DatabaseRelationalAlgebra.md) <--流量用户慎重浏览   
3. [Python正则表达式细节小记](Others/Python/TipsOfRegex.md)  
4. [【动画笔记】二分查找（折半查找）](Algo/BinarySearch.md)  
5. [物理实验霍尔效应判断P/N型半导体笔记](Others/Physics/HallEfxAndSemiconductor.md)  
```

目录结构：  

```
TEST
├─Algo
└─Others
    ├─Physics
    └─Python
```

## 引用项目  

* [rou.js](https://github.com/SomeBottle/rou.js)  
* [Prism](https://github.com/PrismJS/prism)  
* [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)  
* [markdown-It](https://github.com/markdown-it/markdown-it)  
* [markdown-It-Anchor](https://github.com/valeriangalliat/markdown-it-anchor)  

------
### UNDER MIT LICENSE.