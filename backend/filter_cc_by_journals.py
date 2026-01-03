"""
Pinecone 검색 시 CC-BY 저널만 필터링하는 유틸리티

사용 예시:
    from filter_cc_by_journals import get_cc_by_filter, is_commercial_allowed

    # Pinecone 쿼리에 필터 적용
    results = index.query(
        vector=embedding,
        top_k=25,
        include_metadata=True,
        filter=get_cc_by_filter()  # CC-BY 저널만
    )
"""
import json
from pathlib import Path
from typing import List, Dict

# 라이선스 매핑 로드
LICENSE_MAPPING_PATH = Path(__file__).parent / "journal_license_mapping.json"

def load_license_mapping() -> Dict:
    """저널 라이선스 매핑 로드"""
    if LICENSE_MAPPING_PATH.exists():
        with open(LICENSE_MAPPING_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        print(f"⚠️  라이선스 매핑 파일을 찾을 수 없습니다: {LICENSE_MAPPING_PATH}")
        return {"licenses": {}, "commercial_use_allowed": ["CC-BY"]}


def get_cc_by_journals() -> List[str]:
    """상업적 이용 가능한 저널 목록 반환 (CC-BY만)"""
    mapping = load_license_mapping()
    licenses = mapping.get("licenses", {})

    cc_by_journals = [
        journal for journal, license_type in licenses.items()
        if license_type == "CC-BY"
    ]

    return cc_by_journals


def get_cc_by_filter() -> Dict:
    """
    Pinecone 메타데이터 필터 생성 (CC-BY 저널만)

    Returns:
        Pinecone 쿼리에 사용할 필터 딕셔너리

    Example:
        {"journal": {"$in": ["BMC Veterinary Research", "Acta Veterinaria Scandinavica", ...]}}
    """
    cc_by_journals = get_cc_by_journals()

    if not cc_by_journals:
        print("⚠️  CC-BY 저널 목록이 비어있습니다!")
        return {}

    # Pinecone 필터 형식: {"journal": {"$in": [...]}}
    return {
        "journal": {"$in": cc_by_journals}
    }


def is_commercial_allowed(journal_name: str) -> bool:
    """
    특정 저널이 상업적 이용 가능한지 확인

    Args:
        journal_name: 저널 이름

    Returns:
        True if CC-BY, False otherwise
    """
    mapping = load_license_mapping()
    licenses = mapping.get("licenses", {})

    license_type = licenses.get(journal_name, "UNKNOWN")
    return license_type == "CC-BY"


def get_journal_license(journal_name: str) -> str:
    """
    특정 저널의 라이선스 반환

    Args:
        journal_name: 저널 이름

    Returns:
        라이선스 타입 (CC-BY, CC-BY-NC, COPYRIGHT, UNKNOWN 등)
    """
    mapping = load_license_mapping()
    licenses = mapping.get("licenses", {})

    return licenses.get(journal_name, "UNKNOWN")


def print_cc_by_stats():
    """CC-BY 저널 통계 출력"""
    mapping = load_license_mapping()
    licenses = mapping.get("licenses", {})

    cc_by_count = sum(1 for lic in licenses.values() if lic == "CC-BY")
    cc_by_nc_count = sum(1 for lic in licenses.values() if "NC" in lic)
    unknown_count = sum(1 for lic in licenses.values() if lic == "UNKNOWN")
    copyright_count = sum(1 for lic in licenses.values() if lic == "COPYRIGHT")

    total = len(licenses)

    print("="*60)
    print("📊 저널 라이선스 통계")
    print("="*60)
    print(f"✅ CC-BY (상업적 이용 가능):     {cc_by_count:3d} / {total} ({cc_by_count/total*100:.1f}%)")
    print(f"⚠️  CC-BY-NC (상업적 이용 불가): {cc_by_nc_count:3d} / {total} ({cc_by_nc_count/total*100:.1f}%)")
    print(f"❌ COPYRIGHT (상업적 이용 불가): {copyright_count:3d} / {total} ({copyright_count/total*100:.1f}%)")
    print(f"❓ UNKNOWN:                       {unknown_count:3d} / {total} ({unknown_count/total*100:.1f}%)")
    print("="*60)

    return {
        "cc_by": cc_by_count,
        "cc_by_nc": cc_by_nc_count,
        "copyright": copyright_count,
        "unknown": unknown_count,
        "total": total
    }


if __name__ == "__main__":
    # 테스트 실행
    print("\n🔍 CC-BY 저널 필터 테스트\n")

    # 통계 출력
    print_cc_by_stats()

    # CC-BY 저널 목록
    cc_by_journals = get_cc_by_journals()
    print(f"\n✅ 상업적 이용 가능한 저널 ({len(cc_by_journals)}개):")
    for journal in sorted(cc_by_journals):
        print(f"   - {journal}")

    # Pinecone 필터 생성
    print(f"\n📋 Pinecone 필터 (샘플):")
    filter_dict = get_cc_by_filter()
    print(f"   {filter_dict}")

    # 개별 저널 확인
    print(f"\n🔍 개별 저널 라이선스 확인:")
    test_journals = [
        "BMC Veterinary Research",
        "Journal of Veterinary Internal Medicine",
        "Australian Veterinary Journal",
        "Frontiers in Veterinary Science"
    ]

    for journal in test_journals:
        license_type = get_journal_license(journal)
        allowed = is_commercial_allowed(journal)
        status = "✅ 가능" if allowed else "❌ 불가"
        print(f"   {status} | {license_type:15s} | {journal}")
