'use strict';
var loaded = { config: {}, pages: {} },
    pageRead = {}, // 页面读到哪里了，记录scrollTop
    pageDetails = {}, // 页面details标签
    cataArr = [], // 目录数组
    current = ['', 0], // [当前页面路径,当前scrollTop]
    panelOpened = false;
var mark = function (content) { // markdown处理
    return window.markdownit({ html: true, linkify: true })
        .use(window.markdownItAnchor).render(content);
}
function back() { // 返回按钮
    history.go(-1);
}
function s(e, all = false) { // 元素选择
    return all ? document.querySelectorAll(e) : document.querySelector(e);
}
function fHook(resp) {/*用于判断fetch状态码的一个hook*/
    if (resp.status == 200) {
        return resp;
    } else {
        throw 'Error response, code:' + resp.status;
    }
}
function detailsRec(path) {// 记录details标签对应的元素
    let elements = s('details', true), tags = [];
    elements.forEach((val, ind) => {
        tags.push(val.open);
    });
    pageDetails[path] = tags;
}
function detailsOpen(path) {// 操作details标签对应的元素
    let elements = s('details', true), set = pageDetails[path] || [];
    elements.forEach((val, ind) => {
        if (set) val.open = set[ind];
    });
}
function titleUper(current) {
    let pathWords = current ? ` - ${current}` : '';
    document.title = loaded.config.doc_title + pathWords;
}
function renderHook(content) { // 渲染检查
    let config = loaded.config;
    if (config.auto_url) { // 开启了自动url替换
        console.log('URL replaced.');
        content = content.replace(new RegExp(`(a\\s*?href=['"])(?!http|https)(.*?)(['"])`, 'gi'), (match, p1, p2, p3) => {
            p2 = p2.trim()
            return p2.startsWith('#') ? (p1 + 'javascript:void(0);' + p3 + ` onclick="jump(this)" data-id="${p2.replace('#', '')}"`) : (p1 + '#' + p2 + p3);
        })
    }
    return content;
}
function backTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
function generateCata() { // 生成目录
    let elements = s('#content').querySelectorAll('*'), // 获得文档中所有元素
        titleTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        generated = [];
    titleTags = titleTags.filter(x => s(x));
    elements.forEach((val, ind) => {
        let tag = val.tagName.toLowerCase(),
            id = val.id,
            name = val.innerHTML,
            titleIndex = titleTags.indexOf(tag);
        if (titleIndex !== -1) {
            generated[ind] = [id, name, titleIndex];
        } else if (id) {
            generated[ind] = [id, name, titleTags.length];
        }
    });
    cataArr = generated;
}
function jump(e) { // 锚点跳转
    let id = e.getAttribute('data-id'), hash = location.hash.split('/#')[0];
    location.hash = hash + '/#' + id;
}
function catalogue() { // 展示目录面板
    if (!panelOpened) {
        let html = '<h2>目录</h2>';
        cataArr.forEach(x => {
            let [id, name, layer] = x;
            html += `<p class="layer${layer}"><a href="javascript:void(0);" onclick="jump(this)" data-id="${id}" class="cataLinks">${name || id}</a></p>`;
        });
        s('#panel-content').innerHTML = html;
        s('#panel').style.opacity = 1;
        s('#panel').style.width = '500px';
        s('#backBtn').style.opacity = 0;
        panelOpened = true;
    } else {
        s('#panel').style.opacity = 0;
        s('#panel').style.width = '0px';
        s('#backBtn').style.opacity = 1;
        panelOpened = false;
    }
}
function findParentDetails(e) { // 找到父节点中的details标签
    let pointer = e;
    while (pointer && pointer.tagName && pointer.tagName.toLowerCase() !== 'details') {
        pointer = pointer.parentNode;
    }
    return pointer;
}
async function loadPage(path, pageName, lastPN) {
    let prPath = path.split('/#')[0], local = loaded.pages[prPath],
        fromTop = pageRead[path] || 0,
        [currentPage, currentTop] = current,
        config = loaded.config;
    if (!local || prPath !== currentPage) { // 判断需不需要加载页面
        await getPage(prPath, pageName);
    }
    let element = lastPN ? document.getElementById(lastPN.replace('#', '')) : false,
        parent = findParentDetails(element);
    if (parent && element.offsetTop <= 0) {
        parent.open = true; // 自动展开details
    }
    setTimeout(() => {
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        } else if (config.jump_hist) {
            window.scrollTo({// 载入页面后滚到指定位置
                top: fromTop,
                behavior: "smooth"
            });
        }
    }, 200);
}
async function getPage(path, pageName) { // 载入页面(路径,页面名,页码最后一位)
    let local = loaded.pages[path],
        [currentPage, currentTop] = current;
    pageRead[currentPage] = currentTop;
    detailsRec(currentPage);
    current = [path, 0];
    let respPage = await (local ? Promise.resolve(local) : fetch('./' + path)
        .then(resp => fHook(resp).text())
        .catch(e => {
            notice(`页面不存在:${path}`);
            let [p, n] = loaded.config.not_found;
            loadPage(p, n);
            throw e;
        }))
    loaded.pages[path] = respPage;
    titleUper(pageName);
    s('#content').innerHTML = renderHook(mark(respPage));
    Prism.highlightAllUnder(s('#content'));
    detailsOpen(path);
    generateCata();
    return true;
}
function notice(txt) { // 闪烁提示
    s('#notice').style.animation = '';
    s('#notice').innerHTML = txt;
    setTimeout(() => {
        s('#notice').style.animation = 'flash 3s ease';
    }, 200);
}
fetch('./config.json') // 获得配置文件
    .then(resp => fHook(resp).json())
    .catch(e => {
        alert('Failed to get config file.');
        throw e;
    })
    .then(resp => {
        loaded.config = resp;
        if (resp.index.length < 2) {
            s('#content').innerHTML = '<p>请配置config.json</p>';
        }
        console.log('Successfully loaded config.json.');
        return Promise.resolve(resp);
    }).then(config => {
        let [path, name] = config['index'];
        rou.x('content').a('def', 'index', function (a, b, pn) {
            loadPage(path, name, pn.pop());
        });
        for (let p in config['pages']) {
            let currentPG = config['pages'][p];
            rou.a('reg', p, function (a, b, pn) {
                ((PG) => {
                    if (PG.constructor === Object) { // 严格判断类型
                        let wholePath = a + '/' + pn.join('/');
                        for (let i = 0, len = pn.length; i < len; i++) {
                            PG = PG[pn[i]] || [wholePath, 'Not Found'];
                            if (PG.constructor === Array) break;
                        }
                        let [path, name] = PG;
                        loadPage(path, name, pn.pop());
                    } else {
                        let [path, name] = PG;
                        loadPage(path, name, pn.pop());
                    }
                })(currentPG);
            }, '');
        }
        rou.r();
    })
rou.uk((pageKey, pn) => {
    let [p, n] = loaded.config.not_found;
    loadPage(p, n);
})
window.addEventListener('scroll', () => { // 监听滚动事件
    let currentTop = document.body.scrollTop;
    current[1] = currentTop;
    if (currentTop <= 30) {
        s('nav').style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        s('.backTop').style.opacity = 0;
    } else {
        s('nav').style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        s('.backTop').style.opacity = 1;
    }
}, false);
