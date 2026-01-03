"""
필터링 기능이 통합된 XML 논문 처리 파이프라인

워크플로우:
1. XML 폴더 스캔
2. 중복 논문 필터링 (이미 Pinecone에 있는 논문 제외)
3. CC-BY 라이선스 확인
4. 통과한 논문만 청킹 & 임베딩 & Pinecone 저장

사용법:
    python3 process_xml_with_filters.py \\
        --xml-folder /path/to/xmls \\
        --journal "Journal Name" \\
        --progress-file progress.json
"""

import os
import re
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Dict, Optional, Set
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import sys
import argparse
import random

load_dotenv()

# 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("medical-guidelines")


# ============================================================
# Step 0: 필터링 함수들
# ============================================================

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


def extract_license_from_xml(xml_path: Path) -> Optional[str]:
    """XML에서 라이선스 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        for license_elem in root.iter('license'):
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
                if "CC BY-NC" in text_upper or "CC-BY-NC" in text_upper:
                    return "CC-BY-NC"
                elif "CC BY" in text_upper or "CC-BY" in text_upper:
                    return "CC-BY"

            # ext-link 태그에서 URL 찾기
            for ext_link in license_elem.iter('ext-link'):
                href = ext_link.get('href', '') or ext_link.get('{http://www.w3.org/1999/xlink}href', '')
                if href and 'creativecommons.org/licenses/' in href:
                    cc_match = re.search(r'creativecommons\.org/licenses/([\w-]+)', href)
                    if cc_match:
                        license_code = cc_match.group(1).upper()
                        return f"CC-{license_code}"

        return None
    except Exception as e:
        return None


def get_existing_pmcids(journal_name: str = None) -> Set[str]:
    """Pinecone에서 이미 학습된 PMCID 목록 가져오기"""
    existing_pmcids = set()

    for i in range(20):
        random_vector = [random.uniform(-1, 1) for _ in range(1536)]
        filter_dict = {"journal": {"$eq": journal_name}} if journal_name else None

        results = index.query(
            vector=random_vector,
            top_k=10000,
            include_metadata=True,
            filter=filter_dict
        )

        for match in results.matches:
            pmcid = match.metadata.get("pmcid", "")
            if pmcid:
                existing_pmcids.add(pmcid)

        if i > 5 and len(results.matches) == 0:
            break

    return existing_pmcids


def filter_xmls(xml_files: List[Path], journal_name: str = None) -> Dict:
    """
    XML 파일들 필터링

    Returns:
        {
            "valid": [Path, ...],  # 학습 가능
            "duplicate": [Path, ...],  # 중복
            "non_cc_by": [Path, ...],  # 비 CC-BY
            "no_license": [Path, ...]  # 라이선스 불명
        }
    """
    print()
    print("="*80)
    print("🔍 XML 파일 필터링 시작")
    print("="*80)
    print()

    # 1단계: 기존 PMCID 목록 가져오기
    print("📊 1단계: 중복 논문 확인 중...")
    existing_pmcids = get_existing_pmcids(journal_name)
    print(f"   기존 논문: {len(existing_pmcids):,}개 발견")
    print()

    # 2단계: 각 XML 파일 검사
    print("📊 2단계: 각 XML 파일 검사 중...")

    valid_xmls = []
    duplicate_xmls = []
    non_cc_by_xmls = []
    no_license_xmls = []

    for idx, xml_file in enumerate(xml_files, 1):
        if idx % 50 == 0:
            print(f"   진행: {idx}/{len(xml_files)}...")

        # PMCID 추출
        pmcid = extract_pmcid_from_xml(xml_file)

        # 중복 체크
        if pmcid and pmcid in existing_pmcids:
            duplicate_xmls.append(xml_file)
            continue

        # 라이선스 체크
        license_info = extract_license_from_xml(xml_file)

        if license_info == "CC-BY":
            valid_xmls.append(xml_file)
        elif license_info and "NC" in license_info:
            non_cc_by_xmls.append(xml_file)
        elif license_info is None:
            no_license_xmls.append(xml_file)
        else:
            valid_xmls.append(xml_file)  # 다른 CC 라이선스는 일단 허용

    print()
    print("="*80)
    print("📊 필터링 결과")
    print("="*80)
    print(f"✅ 학습 가능 (CC-BY):          {len(valid_xmls):,}개")
    print(f"❌ 중복 (이미 학습됨):         {len(duplicate_xmls):,}개")
    print(f"⚠️  비-CC-BY (상업적 불가):    {len(non_cc_by_xmls):,}개")
    print(f"❓ 라이선스 불명:              {len(no_license_xmls):,}개")
    print("="*80)
    print()

    return {
        "valid": valid_xmls,
        "duplicate": duplicate_xmls,
        "non_cc_by": non_cc_by_xmls,
        "no_license": no_license_xmls
    }


# ============================================================
# Step 1~4: 기존 프로세싱 함수들 (process_frontvet_xml.py와 동일)
# ============================================================

def extract_text_from_element(element, default=""):
    """XML 엘리먼트에서 텍스트 추출"""
    if element is None:
        return default
    text = ''.join(element.itertext()).strip()
    return text if text else default


def extract_xml_metadata(xml_path: Path) -> Dict:
    """PMC XML에서 메타데이터 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        metadata = {
            "title": "",
            "authors": "",
            "journal": "",
            "year": "",
            "doi": "",
            "pmcid": "",
            "pmid": "",
            "abstract": ""
        }

        # PMCID 추출
        pmcid_match = re.search(r'PMC\d+', xml_path.name)
        if pmcid_match:
            metadata["pmcid"] = pmcid_match.group(0)

        article_meta = root.find('.//article-meta')
        if article_meta is None:
            return metadata

        # 제목
        title_elem = article_meta.find('.//article-title')
        if title_elem is not None:
            metadata["title"] = extract_text_from_element(title_elem)

        # 저자
        authors = []
        for contrib in article_meta.findall('.//contrib[@contrib-type="author"]'):
            name_elem = contrib.find('.//name')
            if name_elem is not None:
                surname = extract_text_from_element(name_elem.find('surname'))
                given = extract_text_from_element(name_elem.find('given-names'))
                if surname:
                    author_name = f"{given} {surname}" if given else surname
                    authors.append(author_name)

        if authors:
            if len(authors) <= 6:
                metadata["authors"] = ", ".join(authors)
            else:
                metadata["authors"] = ", ".join(authors[:6]) + ", et al."

        # 저널명
        journal_elem = root.find('.//journal-title')
        if journal_elem is not None:
            metadata["journal"] = extract_text_from_element(journal_elem)

        # 연도
        year_elem = article_meta.find('.//pub-date[@pub-type="epub"]/year')
        if year_elem is None:
            year_elem = article_meta.find('.//pub-date/year')
        if year_elem is not None:
            metadata["year"] = extract_text_from_element(year_elem)

        # DOI
        doi_elem = article_meta.find('.//article-id[@pub-id-type="doi"]')
        if doi_elem is not None:
            metadata["doi"] = extract_text_from_element(doi_elem)

        # PMID
        pmid_elem = article_meta.find('.//article-id[@pub-id-type="pmid"]')
        if pmid_elem is not None:
            metadata["pmid"] = extract_text_from_element(pmid_elem)

        return metadata

    except Exception as e:
        print(f"  ❌ XML 파싱 오류: {e}")
        return {}


def extract_xml_body_text(xml_path: Path) -> str:
    """PMC XML에서 본문 텍스트 추출"""
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        body_elem = root.find('.//body')
        if body_elem is None:
            return ""

        body_text = extract_text_from_element(body_elem)
        return body_text

    except Exception as e:
        return ""


def clean_xml_text(text: str) -> str:
    """XML 텍스트 정리"""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = text.replace('\u200b', '')
    text = text.replace('\xa0', ' ')
    return text.strip()


def recursive_chunk_with_overlap(text: str, chunk_size: int = 600, overlap: int = 150) -> List[str]:
    """Recursive Chunking with Overlap"""
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        if end < len(text):
            found_separator = False
            for separator in ['. ', '.\n', '\n\n', '\n', ' ']:
                last_sep = text.rfind(separator, start, end)
                if last_sep > start:
                    end = last_sep + len(separator)
                    found_separator = True
                    break

            if not found_separator:
                end = start + chunk_size

        chunk = text[start:end].strip()
        if chunk and len(chunk) > 50:
            chunks.append(chunk)

        next_start = end - overlap
        if next_start <= start:
            next_start = start + chunk_size

        start = next_start

        if start >= len(text):
            break

    return chunks


def create_embeddings(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """OpenAI API로 임베딩 생성"""
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch
        )

        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

        print(f"  📊 임베딩 생성: {i+1}-{i+len(batch)}/{len(texts)}")

    return all_embeddings


def upsert_to_pinecone(chunks_metadata: List[Dict], embeddings: List[List[float]], batch_size: int = 100):
    """Pinecone에 벡터 저장"""
    total = len(chunks_metadata)

    for i in range(0, total, batch_size):
        batch_meta = chunks_metadata[i:i + batch_size]
        batch_emb = embeddings[i:i + batch_size]

        vectors = []
        for chunk_meta, embedding in zip(batch_meta, batch_emb):
            metadata = {
                "doc_type": "paper",
                "title": chunk_meta["title"],
                "year": chunk_meta["year"],
                "page": chunk_meta.get("chunk_index", 0),
                "text": chunk_meta["text"],
                "reference_format": chunk_meta["reference_format"],
                "authors": chunk_meta.get("authors", ""),
                "journal": chunk_meta.get("journal", ""),
                "doi": chunk_meta.get("doi", ""),
                "pmcid": chunk_meta.get("pmcid", ""),
                "pmid": chunk_meta.get("pmid", "")
            }

            vectors.append({
                "id": chunk_meta["id"],
                "values": embedding,
                "metadata": metadata
            })

        index.upsert(vectors=vectors)
        print(f"  💾 Pinecone 저장: {i+1}-{i+len(batch_meta)}/{total}")


def process_single_xml(xml_path: Path) -> Dict:
    """단일 XML 파일 처리"""
    try:
        print(f"\n{'='*60}")
        print(f"📄 처리 중: {xml_path.name}")
        print(f"{'='*60}")
        sys.stdout.flush()

        # 메타데이터 추출
        metadata = extract_xml_metadata(xml_path)

        # 본문 텍스트 추출
        body_text = extract_xml_body_text(xml_path)

        if not body_text or len(body_text) < 100:
            print(f"  ⚠️  본문이 너무 짧거나 없습니다.")
            return {"success": False, "error": "본문 없음"}

        # 텍스트 정리
        clean_text = clean_xml_text(body_text)

        # 청크 분할
        chunks = recursive_chunk_with_overlap(clean_text, chunk_size=600, overlap=150)
        print(f"  📦 총 {len(chunks)}개 청크 생성")

        # 각 청크에 메타데이터 추가
        all_chunks_metadata = []

        for chunk_idx, chunk_text in enumerate(chunks):
            pmcid = metadata.get('pmcid', xml_path.stem)
            chunk_id = f"paper_{pmcid}_c{chunk_idx}"
            chunk_id = re.sub(r'[^a-zA-Z0-9_-]', '_', chunk_id)

            ref_parts = []
            if metadata.get('authors'):
                ref_parts.append(metadata['authors'])
            if metadata.get('journal'):
                ref_parts.append(metadata['journal'])
            if metadata.get('year'):
                ref_parts.append(metadata['year'])

            ref_format = ". ".join(ref_parts) if ref_parts else metadata.get('title', '')[:50]
            if metadata.get('doi'):
                ref_format += f". doi:{metadata['doi']}"

            chunk_meta = {
                "id": chunk_id,
                "title": metadata.get("title", ""),
                "year": metadata.get("year", ""),
                "authors": metadata.get("authors", ""),
                "journal": metadata.get("journal", ""),
                "doi": metadata.get("doi", ""),
                "pmcid": metadata.get("pmcid", ""),
                "pmid": metadata.get("pmid", ""),
                "chunk_index": chunk_idx,
                "text": chunk_text,
                "reference_format": ref_format
            }

            all_chunks_metadata.append(chunk_meta)

        # 임베딩 생성
        chunk_texts = [c["text"] for c in all_chunks_metadata]
        embeddings = create_embeddings(chunk_texts)

        # Pinecone에 저장
        upsert_to_pinecone(all_chunks_metadata, embeddings)

        print(f"\n  ✅ 완료!")
        sys.stdout.flush()

        return {
            "success": True,
            "chunks": len(all_chunks_metadata),
            "metadata": metadata
        }

    except Exception as e:
        print(f"\n  ❌ 오류: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


# ============================================================
# 메인 실행
# ============================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="필터링 기능 통합 XML 프로세싱")
    parser.add_argument("--xml-folder", required=True, help="XML 파일 폴더")
    parser.add_argument("--journal", default=None, help="저널 이름")
    parser.add_argument("--progress-file", default="processing_progress.json", help="진행 상황 파일")

    args = parser.parse_args()

    xml_folder = Path(args.xml_folder)
    progress_file = Path(args.progress_file)

    if not xml_folder.exists():
        print(f"❌ 폴더를 찾을 수 없습니다: {xml_folder}")
        exit(1)

    print("="*80)
    print("🚀 필터링 통합 XML 프로세싱 시작")
    print("="*80)
    print(f"📁 폴더: {xml_folder}")
    print(f"📰 저널: {args.journal or '전체'}")
    print("="*80)

    # XML 파일 목록
    xml_files = list(xml_folder.glob("*.xml"))
    xml_files = [f for f in xml_files if not f.name.startswith(".")]

    print(f"\n📊 전체 XML 파일: {len(xml_files)}개")

    # 필터링
    filtered = filter_xmls(xml_files, args.journal)

    # 라이선스 불명 파일 처리 여부 물어보기
    if len(filtered["no_license"]) > 0:
        print(f"\n⚠️  라이선스 불명 파일 {len(filtered['no_license'])}개 발견")
        response = input("라이선스 불명 파일도 처리하시겠습니까? (yes/no): ")
        if response.lower() == "yes":
            filtered["valid"].extend(filtered["no_license"])
            print(f"✅ 라이선스 불명 파일 {len(filtered['no_license'])}개 추가")

    # 진행 상황 로드
    if progress_file.exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            progress = json.load(f)
    else:
        progress = {
            "processed_files": [],
            "total_processed": 0,
            "total_chunks": 0
        }

    processed_set = set(progress["processed_files"])

    # 필터링된 파일 중 미처리 파일만
    to_process = [f for f in filtered["valid"] if f.name not in processed_set]

    print(f"\n📊 처리 대상: {len(to_process)}개 파일")

    if len(to_process) == 0:
        print("✅ 처리할 파일이 없습니다!")
        exit(0)

    # 처리 시작
    for idx, xml_file in enumerate(to_process, 1):
        print(f"\n[{idx}/{len(to_process)}] 처리 중...")

        result = process_single_xml(xml_file)

        if result["success"]:
            progress["processed_files"].append(xml_file.name)
            progress["total_processed"] += 1
            progress["total_chunks"] += result["chunks"]

            # 10개마다 저장
            if progress["total_processed"] % 10 == 0:
                with open(progress_file, 'w', encoding='utf-8') as f:
                    json.dump(progress, f, indent=2, ensure_ascii=False)
                print(f"\n  💾 진행 상황 저장: {progress['total_processed']}개")

    # 최종 저장
    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*80}")
    print("✅ 처리 완료!")
    print(f"{'='*80}")
    print(f"총 처리: {progress['total_processed']}개 파일")
    print(f"총 청크: {progress['total_chunks']:,}개")
    print(f"{'='*80}")
