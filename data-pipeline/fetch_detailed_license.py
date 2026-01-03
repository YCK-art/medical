"""
Europe PMC API를 사용하여 더 정확한 라이선스 정보 조회
"""
import requests
import time
from typing import Optional

def fetch_license_europepmc(pmcid: str) -> Optional[str]:
    """
    Europe PMC API로 라이선스 조회 (더 상세한 정보 제공)

    Args:
        pmcid: PMC ID (예: "PMC6150974")

    Returns:
        라이선스 타입 (CC-BY, CC-BY-NC 등)
    """
    try:
        # PMC 번호만 추출
        pmc_number = pmcid.replace("PMC", "")

        # Europe PMC API
        url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/PMC/{pmc_number}"
        params = {
            "format": "json"
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            print(f"  ⚠️  API 호출 실패 ({pmcid}): {response.status_code}")
            return None

        data = response.json()

        # license 필드 확인
        if "result" in data:
            result = data["result"]

            # license 필드
            license_info = result.get("license", "")
            if license_info:
                # CC-BY, CC-BY-NC 등 표준화
                license_upper = license_info.upper().strip()

                # 공백을 하이픈으로
                license_normalized = license_upper.replace(" ", "-")

                print(f"  ✅ 라이선스 발견: {license_normalized}")
                return license_normalized

            # copyrightNotice 필드도 확인
            copyright_notice = result.get("copyrightNotice", "")
            if "CC BY" in copyright_notice.upper():
                if "NC" in copyright_notice.upper():
                    return "CC-BY-NC"
                elif "ND" in copyright_notice.upper():
                    return "CC-BY-ND"
                elif "SA" in copyright_notice.upper():
                    return "CC-BY-SA"
                else:
                    return "CC-BY"

        print(f"  ⚠️  라이선스 정보 없음 ({pmcid})")
        return None

    except Exception as e:
        print(f"  ❌ 오류 ({pmcid}): {e}")
        return None


def fetch_license_from_fulltext_xml(pmcid: str) -> Optional[str]:
    """
    PMC Full-text XML에서 직접 라이선스 추출

    Args:
        pmcid: PMC ID

    Returns:
        라이선스 타입
    """
    try:
        # PMC OAI-PMH로 전체 XML 가져오기
        pmc_number = pmcid.replace("PMC", "")
        url = f"https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi"
        params = {
            "verb": "GetRecord",
            "identifier": f"oai:pubmedcentral.nih.gov:{pmc_number}",
            "metadataPrefix": "pmc"
        }

        response = requests.get(url, params=params, timeout=15)

        if response.status_code != 200:
            return None

        xml_text = response.text

        # XML 파싱하여 license 태그 찾기
        import xml.etree.ElementTree as ET
        import re

        # XML 네임스페이스 제거 (간단한 파싱을 위해)
        xml_clean = re.sub(r'\sxmlns[^=]*="[^"]*"', '', xml_text)

        try:
            root = ET.fromstring(xml_clean)

            # license 태그 찾기
            for license_elem in root.iter('license'):
                # license-type 속성
                license_type = license_elem.get('license-type', '')
                if license_type:
                    print(f"  📄 license-type 속성: {license_type}")

                # license-p 태그에서 URL 찾기
                for license_p in license_elem.iter('license-p'):
                    text = ''.join(license_p.itertext())
                    print(f"  📄 license-p 내용: {text[:100]}...")

                    # Creative Commons URL 파싱
                    cc_match = re.search(r'creativecommons\.org/licenses/([\w-]+)/(\d+\.\d+)', text)
                    if cc_match:
                        license_code = cc_match.group(1).upper()
                        version = cc_match.group(2)
                        normalized = f"CC-{license_code}"
                        print(f"  ✅ CC 라이선스 발견: {normalized} v{version}")
                        return normalized

                    # 텍스트에서 직접 CC-BY 등 찾기
                    if "CC BY-NC" in text.upper() or "CC-BY-NC" in text.upper():
                        return "CC-BY-NC"
                    elif "CC BY-ND" in text.upper() or "CC-BY-ND" in text.upper():
                        return "CC-BY-ND"
                    elif "CC BY-SA" in text.upper() or "CC-BY-SA" in text.upper():
                        return "CC-BY-SA"
                    elif "CC BY" in text.upper() or "CC-BY" in text.upper():
                        return "CC-BY"

                # ext-link 태그에서 URL 찾기
                for ext_link in license_elem.iter('ext-link'):
                    href = ext_link.get('{http://www.w3.org/1999/xlink}href', '')
                    if not href:
                        href = ext_link.get('href', '')

                    if href:
                        print(f"  🔗 라이선스 링크: {href}")
                        cc_match = re.search(r'creativecommons\.org/licenses/([\w-]+)', href)
                        if cc_match:
                            license_code = cc_match.group(1).upper()
                            normalized = f"CC-{license_code}"
                            print(f"  ✅ CC 라이선스 발견: {normalized}")
                            return normalized

        except ET.ParseError as e:
            print(f"  ⚠️  XML 파싱 오류: {e}")

        return None

    except Exception as e:
        print(f"  ❌ 오류 ({pmcid}): {e}")
        return None


# 테스트
if __name__ == "__main__":
    print("🧪 상세 라이선스 조회 테스트\n")

    test_pmcids = [
        "PMC6150974",  # BMC Veterinary Research
        "PMC5319136",  # BMC Veterinary Research
        "PMC7203717",  # BMC Veterinary Research
    ]

    for pmcid in test_pmcids:
        print("="*60)
        print(f"📄 {pmcid}")
        print("="*60)

        # Europe PMC 시도
        print("🔍 Europe PMC API 조회...")
        license1 = fetch_license_europepmc(pmcid)
        print()

        # Full-text XML 시도
        print("🔍 Full-text XML 조회...")
        license2 = fetch_license_from_fulltext_xml(pmcid)
        print()

        print(f"📊 결과:")
        print(f"  Europe PMC: {license1}")
        print(f"  Full-text XML: {license2}")
        print()

        time.sleep(1)
