"""
Pinecone DB에 이미 학습된 논문을 필터링하여 새로운 XML만 추출

사용법:
    python3 filter_duplicate_papers.py --xml-folder /path/to/xml --journal "Journal Name"
"""
import os
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Set, Dict
from dotenv import load_dotenv
from pinecone import Pinecone
import re
import argparse

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")


def extract_pmcid_from_xml(xml_path: Path) -> str:
    """XML 파일에서 PMCID 추출"""
    try:
        # 파일명에서 PMCID 추출 (예: PMC1234567.xml)
        pmcid_match = re.search(r'PMC\d+', xml_path.name)
        if pmcid_match:
            return pmcid_match.group(0)

        # XML 내용에서 PMCID 추출
        tree = ET.parse(xml_path)
        root = tree.getroot()

        article_meta = root.find('.//article-meta')
        if article_meta is not None:
            pmcid_elem = article_meta.find('.//article-id[@pub-id-type="pmc"]')
            if pmcid_elem is not None:
                return f"PMC{pmcid_elem.text.strip()}"

        return None
    except Exception as e:
        print(f"  ⚠️  PMCID 추출 오류 ({xml_path.name}): {e}")
        return None


def extract_doi_from_xml(xml_path: Path) -> str:
    """XML 파일에서 DOI 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        article_meta = root.find('.//article-meta')
        if article_meta is not None:
            doi_elem = article_meta.find('.//article-id[@pub-id-type="doi"]')
            if doi_elem is not None:
                return doi_elem.text.strip()

        return None
    except Exception as e:
        return None


def get_existing_papers_from_pinecone(journal_name: str = None) -> Set[str]:
    """
    Pinecone DB에서 이미 학습된 논문 목록 추출 (PMCID 기준)

    Args:
        journal_name: 특정 저널만 필터링 (None이면 전체)

    Returns:
        이미 학습된 PMCID 집합
    """
    print(f"🔍 Pinecone DB에서 기존 논문 목록 추출 중...")
    if journal_name:
        print(f"   저널: {journal_name}")

    existing_pmcids = set()
    existing_dois = set()

    # 여러 번 쿼리하여 충분한 샘플 확보
    import random

    for i in range(20):  # 최대 200,000개 샘플
        random_vector = [random.uniform(-1, 1) for _ in range(1536)]

        filter_dict = {"journal": {"$eq": journal_name}} if journal_name else None

        results = index.query(
            vector=random_vector,
            top_k=10000,
            include_metadata=True,
            filter=filter_dict
        )

        for match in results.matches:
            meta = match.metadata
            pmcid = meta.get("pmcid", "")
            doi = meta.get("doi", "")

            if pmcid:
                existing_pmcids.add(pmcid)
            if doi:
                existing_dois.add(doi)

        print(f"   쿼리 {i+1}/20: {len(existing_pmcids):,}개 PMCID, {len(existing_dois):,}개 DOI 발견")

        # 충분히 수집되면 중단
        if i > 5 and len(results.matches) == 0:
            break

    print(f"✅ 기존 논문: {len(existing_pmcids):,}개 (PMCID 기준)")
    return existing_pmcids, existing_dois


def filter_new_xmls(xml_folder: Path, journal_name: str = None) -> Dict:
    """
    새로운 XML 파일만 필터링

    Returns:
        {
            "new_xmls": [...],
            "duplicate_xmls": [...],
            "no_pmcid_xmls": [...]
        }
    """
    print()
    print("="*80)
    print("📂 XML 파일 필터링")
    print("="*80)

    # 기존 논문 목록 가져오기
    existing_pmcids, existing_dois = get_existing_papers_from_pinecone(journal_name)

    # XML 파일 목록
    xml_files = list(xml_folder.glob("*.xml"))
    xml_files = [f for f in xml_files if not f.name.startswith(".")]

    print(f"\n📁 XML 폴더: {xml_folder}")
    print(f"📊 전체 XML 파일: {len(xml_files)}개")
    print()

    new_xmls = []
    duplicate_xmls = []
    no_pmcid_xmls = []

    for xml_file in xml_files:
        pmcid = extract_pmcid_from_xml(xml_file)
        doi = extract_doi_from_xml(xml_file)

        if pmcid:
            if pmcid in existing_pmcids:
                duplicate_xmls.append({
                    "file": xml_file,
                    "pmcid": pmcid,
                    "doi": doi
                })
            else:
                new_xmls.append({
                    "file": xml_file,
                    "pmcid": pmcid,
                    "doi": doi
                })
        elif doi:
            if doi in existing_dois:
                duplicate_xmls.append({
                    "file": xml_file,
                    "pmcid": pmcid,
                    "doi": doi
                })
            else:
                new_xmls.append({
                    "file": xml_file,
                    "pmcid": pmcid,
                    "doi": doi
                })
        else:
            no_pmcid_xmls.append({
                "file": xml_file,
                "pmcid": None,
                "doi": None
            })

    # 결과 출력
    print("="*80)
    print("📊 필터링 결과")
    print("="*80)
    print(f"✅ 새로운 논문 (학습 가능): {len(new_xmls):,}개")
    print(f"❌ 중복 논문 (이미 학습됨): {len(duplicate_xmls):,}개")
    print(f"⚠️  PMCID/DOI 없음: {len(no_pmcid_xmls):,}개")
    print("="*80)

    return {
        "new_xmls": new_xmls,
        "duplicate_xmls": duplicate_xmls,
        "no_pmcid_xmls": no_pmcid_xmls
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="중복 논문 필터링")
    parser.add_argument("--xml-folder", required=True, help="XML 파일 폴더 경로")
    parser.add_argument("--journal", default=None, help="저널 이름 (선택)")

    args = parser.parse_args()

    xml_folder = Path(args.xml_folder)

    if not xml_folder.exists():
        print(f"❌ 폴더를 찾을 수 없습니다: {xml_folder}")
        exit(1)

    result = filter_new_xmls(xml_folder, args.journal)

    # 새로운 XML 파일 목록 출력
    print()
    print("✅ 새로운 XML 파일 목록 (샘플 10개):")
    for item in result["new_xmls"][:10]:
        print(f"   {item['file'].name} (PMCID: {item['pmcid']})")

    if len(result["new_xmls"]) > 10:
        print(f"   ... 외 {len(result['new_xmls']) - 10}개")

    print()
    print("❌ 중복 XML 파일 목록 (샘플 10개):")
    for item in result["duplicate_xmls"][:10]:
        print(f"   {item['file'].name} (PMCID: {item['pmcid']}) - 이미 학습됨")

    if len(result["duplicate_xmls"]) > 10:
        print(f"   ... 외 {len(result['duplicate_xmls']) - 10}개")

    # 결과를 JSON으로 저장
    import json
    output_file = xml_folder / "filtering_result.json"

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "new_xmls": [str(item["file"]) for item in result["new_xmls"]],
            "duplicate_xmls": [str(item["file"]) for item in result["duplicate_xmls"]],
            "no_pmcid_xmls": [str(item["file"]) for item in result["no_pmcid_xmls"]]
        }, f, indent=2, ensure_ascii=False)

    print()
    print(f"💾 필터링 결과 저장: {output_file}")
