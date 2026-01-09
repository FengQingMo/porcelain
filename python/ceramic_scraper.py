import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin, urlparse
import time
import re
import urllib.request
import shutil
import threading
from queue import Queue
from concurrent.futures import ThreadPoolExecutor
import logging
import random

# 设置日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class CeramicScraper:
    def __init__(self):
        self.base_url = 'http://tcg.jdzol.net'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.ceramics = []
        self.ceramics_lock = threading.Lock()
        self.image_counter = 0
        self.image_counter_lock = threading.Lock()
        self.setup_dirs()
        
        # 定义类别和对应的起始页URL
        self.categories = {
            'list_1793': '古代陶瓷',
            'list_1794': '近代陶瓷',
            'list_1795': '现代陶艺',
            'list_1796': '书画杂项'
        }
        
        # 定义朝代字典，包含可能的变体
        self.dynasties = {
            '新石器': ['新石器'],
            '商': ['商', '商代'],
            '周': ['周', '西周', '东周', '春秋', '战国'],
            '秦': ['秦', '秦代'],
            '汉': ['汉', '西汉', '东汉', '两汉'],
            '三国': ['三国', '魏', '蜀', '吴'],
            '晋': ['晋', '西晋', '东晋'],
            '南北朝': ['南北朝', '南朝', '北朝'],
            '隋': ['隋', '隋代'],
            '唐': ['唐', '唐代'],
            '五代': ['五代', '五代十国'],
            '宋': ['宋', '北宋', '南宋', '两宋'],
            '辽': ['辽', '辽代'],
            '金': ['金', '金代'],
            '元': ['元', '元代'],
            '明': ['明', '明代'],
            '清': ['清', '清代'],
            '民国': ['民国', '中华民国'],
            '现代': ['现代', '当代', '现当代']
        }

    def setup_dirs(self):
        """设置必要的目录"""
        self.target_dir = os.path.join(os.getcwd(), 'images')
        logging.info(f"开始设置图片存储目录: {self.target_dir}")
        
        if os.path.exists(self.target_dir):
            for file in os.listdir(self.target_dir):
                file_path = os.path.join(self.target_dir, file)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    logging.error(f'清除文件失败: {file_path}, 错误: {str(e)}')
        else:
            os.makedirs(self.target_dir)
        logging.info("图片存储目录设置完成")

    def get_pagination_urls(self, category_code):
        """获取某个类别的所有分页URL"""
        try:
            # 先访问类别的第一页
            first_page_url = f"{self.base_url}/html/{category_code}.html"
            response = requests.get(first_page_url, headers=self.headers)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 找到分页容器
            pagination = soup.find('div', class_='pagination')
            if not pagination:
                return [first_page_url]
                
            # 收集所有页面URL
            page_urls = set()
            page_urls.add(first_page_url)
            
            # 遍历所有分页链接
            for link in pagination.find_all('a'):
                href = link.get('href')
                if href and (category_code in href):
                    page_url = urljoin(self.base_url, f"/html/{href}")
                    page_urls.add(page_url)
            
            # 转换为列表并排序
            page_urls = sorted(list(page_urls))
            logging.info(f"类别 {self.categories[category_code]} 共找到 {len(page_urls)} 个分页")
            return page_urls
            
        except Exception as e:
            logging.error(f"获取分页URL失败: {str(e)}")
            return [first_page_url]

    def scrape_all_categories(self):
        """按顺序爬取所有类别"""
        # 设置线程池，最大工作线程数为4
        max_workers = 4
        
        for category_code, category_name in self.categories.items():
            logging.info(f"开始爬取类别: {category_name}")
            
            # 获取该类别的所有分页URL
            page_urls = self.get_pagination_urls(category_code)
            logging.info(f"类别 {category_name} 共有 {len(page_urls)} 个分页，开始并行爬取")
            
            # 使用线程池并行爬取该类别的所有页面
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                # 提交所有页面的爬取任务
                future_to_url = {executor.submit(self.scrape_page, url): url for url in page_urls}
                
                # 等待所有任务完成并处理结果
                for future in future_to_url:
                    url = future_to_url[future]
                    try:
                        future.result()  # 获取任务结果，如果有异常会抛出
                    except Exception as e:
                        logging.error(f"爬取页面失败: {url}, 错误: {str(e)}")
            
            logging.info(f"完成类别 {category_name} 的爬取")
            time.sleep(5)  # 类别间隔5秒

    def download_image(self, img_url, title):
        """下载图片"""
        try:
            # 检查URL是否是瓷器相关的图片
            if not any(x in img_url.lower() for x in ['/uploadfiles/', '/uploads/', '/images/']):
                logging.warning(f"跳过非瓷器相关图片: {img_url}")
                return None
                
            # 获取文件扩展名
            file_ext = os.path.splitext(urlparse(img_url).path)[1] or '.jpg'
            
            # 使用线程锁获取唯一的图片ID
            with self.image_counter_lock:
                self.image_counter += 1
                image_id = self.image_counter
            
            # 构建文件名：数字ID.扩展名
            filename = f"{image_id}{file_ext}"
            target_filepath = os.path.join(self.target_dir, filename)

            # 使用 urllib 下载图片
            opener = urllib.request.build_opener()
            opener.addheaders = [('User-agent', self.headers['User-Agent'])]
            urllib.request.install_opener(opener)
            
            # 直接下载到目标目录
            urllib.request.urlretrieve(img_url, target_filepath)
            logging.info(f"已下载瓷器图片: {filename}")
            
            # 返回相对路径
            return f"images/{filename}"
        except Exception as e:
            logging.error(f"下载图片失败: {img_url}, 错误: {str(e)}")
            return None

    def extract_dynasty(self, text):
        """从文本中提取朝代"""
        if not text:
            return None
            
        # 遍历朝代字典
        for dynasty, variants in self.dynasties.items():
            for variant in variants:
                # 检查变体是否在文本中
                if variant in text:
                    return dynasty
        return None

    def scrape_page(self, url):
        """爬取单个页面的瓷器信息"""
        try:
            # 添加随机延时，避免请求过快
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(url, headers=self.headers)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 找到所有瓷器项目容器
            ceramic_items = soup.find_all('div', class_='xfgs-item')
            logging.info(f"在页面 {url} 中找到 {len(ceramic_items)} 个瓷器项目")
            
            for item in ceramic_items:
                try:
                    # 初始化基本信息
                    details = {
                        'title': None,
                        'dynasty': None,
                        'author': None,
                        'dimensions': {},
                        'description': None,
                        'source_url': None,
                        'image_url': None,
                        'local_image': None
                    }

                    # 获取图片URL
                    img_div = item.find('div', class_='xfgs-item-img')
                    if img_div:
                        style = img_div.get('style', '')
                        img_match = re.search(r"url\('([^']+)'\)", style)
                        if img_match:
                            img_url = img_match.group(1)
                            if not img_url.startswith('http'):
                                img_url = urljoin(self.base_url, img_url)
                            details['image_url'] = img_url
                            logging.info(f"找到列表页图片: {img_url}")

                    # 获取信息容器
                    info_div = item.find('div', class_='xfgs-info')
                    if info_div:
                        # 获取标题和链接
                        title_link = info_div.find('a')
                        if title_link and title_link.get('href'):
                            details['title'] = title_link.text.strip()
                            detail_url = urljoin(self.base_url, title_link['href'])
                            details['source_url'] = detail_url

                            # 从标题中提取朝代
                            if details['title']:
                                details['dynasty'] = self.extract_dynasty(details['title'])

                            # 提取作者
                            author_match = re.search(r'^([^绘]+)绘', details['title'])
                            if author_match:
                                details['author'] = author_match.group(1)

                        # 获取描述
                        description_p = info_div.find_all('p')[-1]  # 获取最后一个p标签的内容
                        if description_p:
                            details['description'] = description_p.text.strip()
                            
                            # 如果标题中没找到朝代，尝试从描述中提取
                            if not details['dynasty'] and details['description']:
                                details['dynasty'] = self.extract_dynasty(details['description'])
                            
                            if details['description'].endswith('...'):
                                # 如果描述以...结尾，说明有详细页面，需要获取完整描述
                                try:
                                    detail_response = requests.get(detail_url, headers=self.headers)
                                    detail_response.encoding = 'utf-8'
                                    detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                                    
                                    # 获取详细页面的完整描述
                                    content_div = detail_soup.find('div', class_='content')
                                    if content_div:
                                        full_description = content_div.get_text().strip()
                                        if full_description:
                                            details['description'] = full_description
                                            
                                            # 如果之前没找到朝代，尝试从完整描述中提取
                                            if not details['dynasty']:
                                                details['dynasty'] = self.extract_dynasty(full_description)
                                            
                                            # 从详细描述中提取尺寸信息
                                            dimensions_patterns = [
                                                r'高\s*(\d+\.?\d*)\s*cm',
                                                r'直径\s*(\d+\.?\d*)\s*cm',
                                                r'口径\s*(\d+\.?\d*)\s*cm',
                                                r'宽\s*(\d+\.?\d*)\s*cm',
                                                r'长\s*(\d+\.?\d*)\s*cm'
                                            ]
                                            
                                            dimension_mapping = {
                                                '高': 'height',
                                                '直径': 'diameter',
                                                '口径': 'diameter',
                                                '宽': 'width',
                                                '长': 'length'
                                            }
                                            
                                            for pattern in dimensions_patterns:
                                                match = re.search(pattern, full_description)
                                                if match:
                                                    dimension_type = re.search(r'(高|直径|口径|宽|长)', pattern).group(1)
                                                    dimension_value = float(match.group(1))
                                                    details['dimensions'][dimension_mapping[dimension_type]] = dimension_value

                                except Exception as e:
                                    logging.error(f"获取详细页面信息失败: {str(e)}")

                    # 下载图片
                    if details['image_url']:
                        logging.info(f"开始下载图片: {details['image_url']}")
                        local_image = self.download_image(details['image_url'], details['title'])
                        if local_image:
                            details['local_image'] = local_image
                            logging.info(f"图片下载完成: {local_image}")

                    # 使用线程锁保护共享资源访问
                    if details['title'] and details['source_url']:  # 只保存有标题和来源的数据
                        with self.ceramics_lock:
                            self.ceramics.append(details)
                        logging.info(f"完成爬取: {details['title']}, 朝代: {details['dynasty'] or '未知'}")
                    
                except Exception as e:
                    logging.error(f"处理瓷器项目失败: {str(e)}")
                    continue
                    
        except Exception as e:
            logging.error(f"爬取页面失败: {url}, 错误: {str(e)}")

    def save_to_json(self, filename='ceramics_data.json'):
        """保存数据到JSON文件"""
        filepath = os.path.join(os.getcwd(), filename)
        logging.info(f"开始保存数据到文件: {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.ceramics, f, ensure_ascii=False, indent=2)
        logging.info(f"数据已成功保存到: {filepath}")
        logging.info(f"共保存 {len(self.ceramics)} 条瓷器数据")

def main():
    logging.info("=== 瓷器数据爬虫开始运行 ===")
    
    # 添加随机数种子
    random.seed()
    
    scraper = CeramicScraper()
    scraper.scrape_all_categories()
    scraper.save_to_json('ceramics_data.json')
    logging.info("=== 瓷器数据爬虫运行完成 ===")

if __name__ == '__main__':
    main() 