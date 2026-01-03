"""
XML 파일들의 CC-BY 라이선스 여부를 확인

사용법:
    python3 check_cc_by_license.py --xml-folder /path/to/xml
"""
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Optional
import re
import argparse
import time
import requests
from bs4 import BeautifulSoup


def extract_license_from_xml(xml_path: Path) -> Optional[str]:
    """
    XML 파일에서 직접 라이선스 정보 추출

    Returns:
        라이선스 타입 (CC-BY, CC-BY-NC 등) 또는 None
    """
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Method 1: license 태그 찾기
        for license_elem in root.iter('license'):
            # license-type 속성
            license_type = license_elem.get('license-type', '')

            # license-p 태그에서 텍스트 추출
            for license_p in license_elem.iter('license-p'):
                text = ''.join(license_p.itertext())

                # Creative Commons URL 파싱
                cc_match = re.search(r'creativecommons\.org/licenses/([\w-]+)/', text)
                if cc_match:
                    license_code = cc_match.group(1).upper()
                    return f"CC-{license_code}"

                # 텍스트에서 직접 CC-BY 등 찾기
                text_upper = text.upper()
                if "CC BY-NC-ND" in text_upper or "CC-BY-NC-ND" in text_upper:
                    return "CC-BY-NC-ND"
                elif "CC BY-NC-SA" in text_upper or "CC-BY-NC-SA" in text_upper:
                    return "CC-BY-NC-SA"
                elif "CC BY-NC" in text_upper or "CC-BY-NC" in text_upper:
                    return "CC-BY-NC"
                elif "CC BY-ND" in text_upper or "CC-BY-ND" in text_upper:
                    return "CC-BY-ND"
                elif "CC BY-SA" in text_upper or "CC-BY-SA" in text_upper:
                    return "CC-BY-SA"
                elif "CC BY" in text_upper or "CC-BY" in text_upper:
                    return "CC-BY"

            # ext-link 태그에서 URL 찾기
            for ext_link in license_elem.iter('ext-link'):
                href = ext_link.get('href', '') or ext_link.get('{http://www.w3.org/1999/xlink}href', '')

                if href:
                    cc_match = re.search(r'creativecommons\.org/licenses/([\w-]+)', href)
                    if cc_match:
                        license_code = cc_match.group(1).upper()
                        return f"CC-{license_code}"

        # Method 2: permissions 태그 확인
        for permissions in root.iter('permissions'):
            text = ''.join(permissions.itertext())
            text_upper = text.upper()

            if "CC BY" in text_upper or "CC-BY" in text_upper:
                if "NC" in text_upper:
                    return "CC-BY-NC"
                else:
                    return "CC-BY"

        return None

    except Exception as e:
        print(f"  ⚠️  라이선스 추출 오류 ({xml_path.name}): {e}")
        return None


def extract_pmcid_from_xml(xml_path: Path) -> Optional[str]:
    """XML에서 PMCID 추출"""
    try:
        pmcid_match = re.search(r'PMC\d+', xml_path.name)
        if pmcid_match:
            return pmcid_match.group(0)

        tree = ET.parse(xml_path)
        root = tree.getroot()

        article_meta = root.find('.//article-meta')
        if article_meta is not None:
            pmcid_elem = article_meta.find('.//article-id[@pub-id-type="pmc"]')
            if pmcid_elem is not None:
                return f"PMC{pmcid_elem.text.strip()}"

        return None
    except:
        return None


def scrape_license_from_pmc(pmcid: str) -> Optional[str]:
    """
    PMC 웹페이지에서 라이선스 스크래핑 (백업 방법)
    """
    try:
        url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/"
        headers = {"User-Agent": "Mozilla/5.0"}

        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, 'html.parser')

        # CC 라이선스 링크 찾기
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'creativecommons.org/licenses/' in href:
                match = re.search(r'creativecommons\.org/licenses/([\w-]+)/', href)
                if match:
                    license_code = match.group(1).upper()
                    return f"CC-{license_code}"

        return None

    except Exception as e:
        return None


def check_cc_by_licenses(xml_folder: Path, use_web_scraping: bool = False) -> Dict:
    """
    XML 파일들의 CC-BY 라이선스 확인

    Args:
        xml_folder: XML 파일 폴더
        use_web_scraping: 웹 스크래핑 사용 여부 (느리지만 정확)

    Returns:
        {
            "cc_by": [...],
            "cc_by_nc": [...],
            "unknown": [...]
        }
    """
    print("="*80)
    print("📋 CC-BY 라이선스 확인")
    print("="*80)
    print()

    xml_files = list(xml_folder.glob("*.xml"))
    xml_files = [f for f in xml_files if not f.name.startswith(".")]

    print(f"📁 XML 폴더: {xml_folder}")
    print(f"📊 전체 XML 파일: {len(xml_files)}개")
    print()

    cc_by_papers = []
    cc_by_nc_papers = []
    other_license_papers = []
    unknown_papers = []

    for idx, xml_file in enumerate(xml_files, 1):
        if idx % 50 == 0:
            print(f"진행: {idx}/{len(xml_files)}...")

        # XML에서 직접 라이선스 추출
        license_info = extract_license_from_xml(xml_file)

        # 라이선스를 찾지 못했고 웹 스크래핑 옵션이 켜져 있으면
        if license_info is None and use_web_scraping:
            pmcid = extract_pmcid_from_xml(xml_file)
            if pmcid:
                license_info = scrape_license_from_pmc(pmcid)
                time.sleep(0.5)  # Rate limiting

        # 분류
        if license_info == "CC-BY":
            cc_by_papers.append({"file": xml_file, "license": license_info})
        elif license_info and "NC" in license_info:
            cc_by_nc_papers.append({"file": xml_file, "license": license_info})
        elif license_info:
            other_license_papers.append({"file": xml_file, "license": license_info})
        else:
            unknown_papers.append({"file": xml_file, "license": "UNKNOWN"})

    print()
    print("="*80)
    print("📊 라이선스 확인 결과")
    print("="*80)
    print(f"✅ CC-BY (상업적 이용 가능):     {len(cc_by_papers):,}개")
    print(f"⚠️  CC-BY-NC (상업적 이용 불가): {len(cc_by_nc_papers):,}개")
    print(f"⚠️  기타 라이선스:               {len(other_license_papers):,}개")
    print(f"❓ 라이선스 불명:                {len(unknown_papers):,}개")
    print("="*80)

    return {
        "cc_by": cc_by_papers,
        "cc_by_nc": cc_by_nc_papers,
        "other": other_license_papers,
        "unknown": unknown_papers
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CC-BY 라이선스 확인")
    parser.add_argument("--xml-folder", required=True, help="XML 파일 폴더 경로")
    parser.add_argument("--web-scraping", action="store_true", help="웹 스크래핑 사용 (느림)")

    args = parser.parse_args()

    xml_folder = Path(args.xml_folder)

    if not xml_folder.exists():
        print(f"❌ 폴더를 찾을 수 없습니다: {xml_folder}")
        exit(1)

    result = check_cc_by_licenses(xml_folder, args.web_scraping)

    # 결과 출력
    print()
    print("✅ CC-BY 논문 (샘플 10개):")
    for item in result["cc_by"][:10]:
        print(f"   {item['file'].name}")

    if len(result["cc_by"]) > 10:
        print(f"   ... 외 {len(result['cc_by']) - 10}개")

    print()
    print("⚠️  비-CC-BY 논문 (샘플 10개):")
    for item in result["cc_by_nc"][:10]:
        print(f"   {item['file'].name} ({item['license']})")

    if len(result["cc_by_nc"]) > 10:
        print(f"   ... 외 {len(result['cc_by_nc']) - 10}개")

    # 결과 저장
    import json
    output_file = xml_folder / "license_check_result.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "cc_by": [str(item["file"]) for item in result["cc_by"]],
            "cc_by_nc": [str(item["file"]) for item in result["cc_by_nc"]],
            "other": [str(item["file"]) for item in result["other"]],
            "unknown": [str(item["file"]) for item in result["unknown"]]
        }, f, indent=2, ensure_ascii=False)

    print()
    print(f"💾 라이선스 확인 결과 저장: {output_file}")
