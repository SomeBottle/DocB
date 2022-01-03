import os
import re
import json

ab_path = os.path.dirname(__file__)
pages = {}


def input_dir():
    recv = input('请输入你要生成文档的目录(首尾不要斜杠)：')
    recv_path = ab_path+'/'+recv
    return (recv, recv_path) if os.path.isdir(recv_path) else input_dir()


def input_file(rela_path):
    recv = input('请输入你要用作主页index的文档文件(基于上述目录)：')
    recv_path = ab_path+'/'+rela_path+'/'+recv
    return (recv, recv_path.strip().lower()) if os.path.isfile(recv_path) else input_file(rela_path)


def operate_dict(path):
    pointer = pages
    if path:
        sep = [x for x in path.split('/') if x != '']
        for i in sep:
            if i not in pointer.keys():
                pointer[i] = {}
            pointer = pointer[i]
    return pointer


def get_title(file_path):
    title = ''
    with open(file_path, encoding='utf-8') as file:
        lines = file.readlines()
    for o in lines:
        line = o.strip()
        if line.startswith('#'):
            title = re.sub(r'#+\s*', '', line)
            break
    return title


if __name__ == "__main__":
    rela_path, root_dir = input_dir()
    (index_file, index_path) = input_file(rela_path)
    for root, dirs, files in os.walk(root_dir):
        root = root.replace('\\', '/')
        clean_path = root.split('/'+rela_path)[1]
        path = rela_path+clean_path
        operating = operate_dict(clean_path)
        for i in files:
            if i.lower() == index_file:
                continue
            file_path = path+'/'+i
            file_title = get_title(ab_path+'/'+file_path)
            operating[i] = [file_path, file_title]
    config = {
        "doc_title": "Document",
        "auto_url": True,
        "index": {},
        "pages": pages,
        "not_found": ["404.md", "404"]
    }
    index_title = get_title(index_path)
    config["index"] = [rela_path+'/'+index_file, index_title]
    with open(ab_path+'/config.json', 'w+', encoding='utf-8') as file:
        file.write(json.dumps(config, indent=2, ensure_ascii=False))
    print('Config file generated successfully! ')
