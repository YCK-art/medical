"""
PMC API를 사용하여 논문의 라이선스 정보 조회

PubMed Central API 문서:
https://www.ncbi.nlm.nih.gov/pmc/tools/developers/
"""
import requests
import time
from typing import Optional

def fetch_license_from_pmcid(pmcid: str) -> Optional[str]:
    """
    PMCID로 PubMed Central에서 라이선스 정보 조회

    Args:
        pmcid: PMC ID (예: "PMC6150974")

    Returns:
        라이선스 타입 (예: "CC-BY", "CC-BY-NC") 또는 None
    """
    try:
        # PMC OAI-PMH API 사용
        # https://www.ncbi.nlm.nih.gov/pmc/tools/oai/
        url = f"https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi"
        params = {
            "verb": "GetRecord",
            "identifier": f"oai:pubmedcentral.nih.gov:{pmcid.replace('PMC', '')}",
            "metadataPrefix": "pmc"
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            print(f"  ⚠️  API 호출 실패 ({pmcid}): {response.status_code}")
            return None

        # XML 응답에서 license 정보 찾기
        xml_content = response.text

        # license-type 속성 찾기
        # 예: <license license-type="open-access">
        # 예: <license license-type="CC BY">
        import re

        # license 태그에서 license-type 속성 추출
        license_match = re.search(r'<license[^>]*license-type="([^"]+)"', xml_content)
        if license_match:
            license_type = license_match.group(1)

            # 표준화
            license_normalized = license_type.upper().replace(" ", "-")

            # CC-BY 변형들 처리
            if "CC" in license_normalized and "BY" in license_normalized:
                return license_normalized
            elif license_normalized in ["OPEN-ACCESS", "OA"]:
                # open-access이지만 구체적 라이선스 불명
                return "OPEN-ACCESS"
            else:
                return license_type

        # license 태그 내부에 URL이 있는 경우
        # 예: <license><license-p>http://creativecommons.org/licenses/by/4.0/</license-p></license>
        cc_url_match = re.search(r'creativecommons\.org/licenses/([\w-]+)/', xml_content)
        if cc_url_match:
            license_code = cc_url_match.group(1).upper()
            return f"CC-{license_code}"

        print(f"  ⚠️  라이선스 정보를 찾을 수 없음 ({pmcid})")
        return None

    except Exception as e:
        print(f"  ❌ 오류 ({pmcid}): {e}")
        return None


def fetch_license_from_doi(doi: str) -> Optional[str]:
    """
    DOI로 CrossRef API에서 라이선스 정보 조회

    Args:
        doi: DOI (예: "10.1186/s12917-018-1638-1")

    Returns:
        라이선스 타입 또는 None
    """
    try:
        # CrossRef API
        url = f"https://api.crossref.org/works/{doi}"
        headers = {
            "User-Agent": "MedicalRAG/1.0 (mailto:contact@example.com)"
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print(f"  ⚠️  CrossRef API 호출 실패 ({doi}): {response.status_code}")
            return None

        data = response.json()

        # license 필드 확인
        if "message" in data and "license" in data["message"]:
            licenses = data["message"]["license"]
            if licenses and len(licenses) > 0:
                # 첫 번째 라이선스 URL 파싱
                license_url = licenses[0].get("URL", "")

                if "creativecommons.org/licenses/" in license_url:
                    # CC 라이선스 추출
                    import re
                    match = re.search(r'creativecommons\.org/licenses/([\w-]+)/', license_url)
                    if match:
                        license_code = match.group(1).upper()
                        return f"CC-{license_code}"

                return license_url

        print(f"  ⚠️  라이선스 정보를 찾을 수 없음 ({doi})")
        return None

    except Exception as e:
        print(f"  ❌ 오류 ({doi}): {e}")
        return None


def fetch_license(pmcid: str = None, pmid: str = None, doi: str = None) -> Optional[str]:
    """
    PMCID, PMID, DOI 중 하나를 사용하여 라이선스 조회

    우선순위: PMCID > DOI > PMID
    """
    # PMCID 먼저 시도
    if pmcid and pmcid.startswith("PMC"):
        license_info = fetch_license_from_pmcid(pmcid)
        if license_info:
            return license_info
        time.sleep(0.4)  # API rate limit (3 requests/sec)

    # DOI 시도
    if doi:
        license_info = fetch_license_from_doi(doi)
        if license_info:
            return license_info
        time.sleep(0.4)

    # PMID는 PMCID로 변환 후 시도 가능
    # (여기서는 생략)

    return None


# 테스트
if __name__ == "__main__":
    print("🧪 라이선스 조회 테스트\n")

    # 테스트 케이스
    test_cases = [
        {"pmcid": "PMC6150974", "doi": "10.1186/s12917-018-1638-1"},
        {"pmcid": "PMC5319136", "doi": None},
        {"pmcid": "PMC7203717", "doi": None},
    ]

    for idx, case in enumerate(test_cases, 1):
        print(f"[{idx}] 테스트 중...")
        print(f"  PMCID: {case.get('pmcid')}")
        print(f"  DOI: {case.get('doi')}")

        license_info = fetch_license(
            pmcid=case.get('pmcid'),
            doi=case.get('doi')
        )

        print(f"  ✅ 라이선스: {license_info}")
        print()
        time.sleep(1)  # 너무 빠르게 요청하지 않도록
