"""
PMC 웹페이지에서 직접 라이선스 정보 스크래핑

각 논문의 PMC 페이지 (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC######/)에서
라이선스 정보를 직접 추출
"""
import requests
from bs4 import BeautifulSoup
import time
import json
import re
from typing import Optional

def scrape_license_from_pmc_webpage(pmcid: str) -> Optional[str]:
    """
    PMC 웹페이지에서 라이선스 정보 스크래핑

    Args:
        pmcid: PMC ID (예: "PMC6150974")

    Returns:
        라이선스 타입 (CC-BY, CC-BY-NC 등) 또는 None
    """
    try:
        url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/"

        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }

        response = requests.get(url, headers=headers, timeout=15)

        if response.status_code != 200:
            print(f"  ⚠️  페이지 로드 실패 ({pmcid}): {response.status_code}")
            return None

        soup = BeautifulSoup(response.text, 'html.parser')

        # 방법 1: license-p 클래스 찾기
        license_elem = soup.find(class_='license-p')
        if license_elem:
            license_text = license_elem.get_text()
            print(f"  📄 라이선스 텍스트: {license_text[:100]}...")

            # CC 라이선스 파싱
            if "CC BY-NC-ND" in license_text or "CC-BY-NC-ND" in license_text:
                return "CC-BY-NC-ND"
            elif "CC BY-NC-SA" in license_text or "CC-BY-NC-SA" in license_text:
                return "CC-BY-NC-SA"
            elif "CC BY-NC" in license_text or "CC-BY-NC" in license_text:
                return "CC-BY-NC"
            elif "CC BY-ND" in license_text or "CC-BY-ND" in license_text:
                return "CC-BY-ND"
            elif "CC BY-SA" in license_text or "CC-BY-SA" in license_text:
                return "CC-BY-SA"
            elif "CC BY" in license_text or "CC-BY" in license_text:
                return "CC-BY"
            elif "open access" in license_text.lower():
                return "OPEN-ACCESS"

        # 방법 2: 모든 a 태그에서 creativecommons.org 링크 찾기
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'creativecommons.org/licenses/' in href:
                print(f"  🔗 CC 라이선스 링크: {href}")

                # URL에서 라이선스 타입 추출
                match = re.search(r'creativecommons\.org/licenses/([\w-]+)/', href)
                if match:
                    license_code = match.group(1).upper()
                    normalized = f"CC-{license_code}"
                    return normalized

        # 방법 3: 텍스트에서 검색
        page_text = soup.get_text()
        if "This is an open access article" in page_text:
            # open access 섹션 찾기
            if "CC BY-NC" in page_text:
                return "CC-BY-NC"
            elif "CC BY" in page_text:
                return "CC-BY"

        print(f"  ⚠️  라이선스 정보를 찾을 수 없음 ({pmcid})")
        return None

    except Exception as e:
        print(f"  ❌ 오류 ({pmcid}): {e}")
        return None


def batch_scrape_licenses(pmcids: list, delay: float = 0.5) -> dict:
    """
    여러 PMCID의 라이선스를 일괄 스크래핑

    Args:
        pmcids: PMCID 리스트
        delay: 요청 간 대기 시간 (초)

    Returns:
        {pmcid: license_type} 딕셔너리
    """
    results = {}

    for idx, pmcid in enumerate(pmcids, 1):
        print(f"[{idx}/{len(pmcids)}] {pmcid} 조회 중...")

        license_info = scrape_license_from_pmc_webpage(pmcid)

        if license_info:
            results[pmcid] = license_info
            print(f"  ✅ {license_info}")
        else:
            results[pmcid] = "UNKNOWN"
            print(f"  ❓ UNKNOWN")

        print()

        # Rate limiting
        time.sleep(delay)

    return results


# 테스트
if __name__ == "__main__":
    print("🧪 PMC 웹페이지 라이선스 스크래핑 테스트\n")

    # 샘플 PMCID들 (다양한 저널)
    test_pmcids = [
        "PMC6150974",  # BMC Veterinary Research
        "PMC5319136",  # BMC Veterinary Research
        "PMC7203717",  # BMC Veterinary Research
        "PMC9434894",  # BMC Veterinary Research (최근)
        "PMC8019166",  # Acta Veterinaria Scandinavica
    ]

    results = batch_scrape_licenses(test_pmcids, delay=1.0)

    print("="*60)
    print("📊 최종 결과")
    print("="*60)
    for pmcid, license_type in results.items():
        print(f"{pmcid}: {license_type}")
